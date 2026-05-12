import { db } from '@/lib/turso';
import { NextRequest, NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';

// ─── Cached ID Pool (server-side via unstable_cache) ───────────────────────────
const getCachedIdPool = unstable_cache(
  async (min: number, max: number, theme: string | null): Promise<string[]> => {
    let sql = `SELECT id FROM puzzles WHERE rating BETWEEN ? AND ? AND popularity > 0`;
    const args: (string | number)[] = [min, max];

    if (theme && theme !== 'random') {
      sql += ` AND themes LIKE ?`;
      args.push(`%${theme}%`);
    }

    sql += ` LIMIT 5000`;

    const result = await db.execute({ sql, args });
    return result.rows.map(r => r.id as string);
  },
  ['puzzle-id-pool'],
  { revalidate: 3600, tags: ['puzzle-ids'] }
);

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const rating = parseInt(searchParams.get('rating') || '1200');
  const theme = searchParams.get('theme') || null;
  const excludeIds = new Set(
    searchParams.get('excludeIds')?.split(',').filter(Boolean) || []
  );

  // ─── Bucketing Logic ───────────────────────────────────────────────────────
  // Round to nearest 100 to ensure users share cache pools.
  const bucket = Math.floor(rating / 100) * 100;
  const minRating = bucket - 200;
  const maxRating = bucket + 200;
  // ───────────────────────────────────────────────────────────────────────────

  try {
    // Fetch 3 puzzles in a batch to reduce DB calls
    const puzzles = await fetchPuzzleBatch(minRating, maxRating, theme, excludeIds, 3);

    if (puzzles.length === 0) {
      // Fallback: widen rating range if the band pool is exhausted / filtered out
      if (theme && theme !== 'random') {
        const fallbackPuzzles = await fetchPuzzleBatch(0, 9999, theme, new Set(), 3);
        if (fallbackPuzzles.length > 0) {
          const response = NextResponse.json({ puzzles: fallbackPuzzles });
          response.headers.set('Cache-Control', 'private, max-age=60');
          return response;
        }
      }
      return NextResponse.json({ error: 'No puzzles found' }, { status: 404 });
    }

    const response = NextResponse.json({ puzzles });
    response.headers.set('Cache-Control', 'private, max-age=300'); // Cache for 5 min since results vary by excludeIds
    return response;

  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function fetchPuzzleBatch(
  min: number,
  max: number,
  theme: string | null,
  excludeIds: Set<string>,
  batchSize: number
) {
  // Step 1: Get cached ID pool (shared across all users in this rating bucket)
  const pool = await getCachedIdPool(min, max, theme);
  if (!pool.length) return [];

  // Step 2: Pick random unique IDs from the pool, skipping excluded ones
  const selectedIds: string[] = [];
  let attempts = 0;
  const maxAttempts = batchSize * 10; // Prevent infinite loops

  while (selectedIds.length < batchSize && attempts < maxAttempts) {
    const candidate = pool[Math.floor(Math.random() * pool.length)];
    if (!excludeIds.has(candidate) && !selectedIds.includes(candidate)) {
      selectedIds.push(candidate);
    }
    attempts++;
  }

  if (selectedIds.length === 0) {
    // Fallback: just pick any from pool (ignore exclusions)
    for (let i = 0; i < batchSize && i < pool.length; i++) {
      selectedIds.push(pool[i]);
    }
  }

  // Step 3: Batch fetch all puzzles at once - exactly 1 DB read
  if (selectedIds.length === 0) return [];

  const placeholders = selectedIds.map(() => '?').join(',');
  const result = await db.execute({
    sql: `SELECT id, fen, moves, rating, themes FROM puzzles WHERE id IN (${placeholders})`,
    args: selectedIds,
  });

  return result.rows.map(row => ({
    id: row.id,
    fen: row.fen,
    rating: row.rating,
    themes: (row.themes as string).split(' '),
    opponentMove: (row.moves as string).split(' ')[0],
    solution: (row.moves as string).split(' ').slice(1),
  }));
}

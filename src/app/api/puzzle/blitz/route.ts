import { db } from '@/lib/turso';
import { NextRequest, NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';

// ─── Cached ID Pool (server-side via unstable_cache) ───────────────────────────
const getCachedIdPool = unstable_cache(
  async (min: number, max: number): Promise<string[]> => {
    const sql = `SELECT id FROM puzzles WHERE rating BETWEEN ? AND ? AND themes LIKE '%oneMove%' AND popularity > 0 LIMIT 5000`;
    const args = [min, max];

    const result = await db.execute({ sql, args });
    return result.rows.map(r => r.id as string);
  },
  ['puzzle-ids-blitz'],
  { revalidate: 3600, tags: ['puzzle-ids'] }
);

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rating = parseInt(searchParams.get('rating') || '1200');
  const excludeIds = new Set(
    searchParams.get('excludeIds')?.split(',').filter(Boolean) || []
  );

  // Bucketing logic to share cache pools across users
  const bucket = Math.floor(rating / 100) * 100;
  const minRating = bucket - 200;
  const maxRating = bucket + 200;

  try {
    const pool = await getCachedIdPool(minRating, maxRating);

    if (!pool.length) {
      return NextResponse.json({ error: 'No puzzles found in this range' }, { status: 404 });
    }

    // Filter out excluded IDs
    const availableIds = pool.filter(id => !excludeIds.has(id));
    
    // Pick 5 random unique IDs from the available pool
    const selectedIds: string[] = [];
    const sourcePool = availableIds.length >= 5 ? availableIds : pool;
    const poolCopy = [...sourcePool];
    
    for (let i = 0; i < 5 && poolCopy.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * poolCopy.length);
      selectedIds.push(poolCopy.splice(randomIndex, 1)[0]);
    }

    // Batch fetch the 5 puzzles - exactly 1 DB read
    const placeholders = selectedIds.map(() => '?').join(',');
    const result = await db.execute({
      sql: `SELECT id, fen, moves, rating, themes FROM puzzles WHERE id IN (${placeholders})`,
      args: selectedIds,
    });

    const puzzles = result.rows.map(row => {
      const allMoves = (row.moves as string).split(' ');
      return {
        id: row.id,
        fen: row.fen,
        rating: row.rating,
        themes: (row.themes as string).split(' '),
        opponentMove: allMoves[0],
        solution: [allMoves[1]], // Blitz puzzles are 1-move only
      };
    });

    const response = NextResponse.json({ puzzles });
    response.headers.set('Cache-Control', 'private, max-age=60');
    return response;

  } catch (err: any) {
    console.error('Blitz API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

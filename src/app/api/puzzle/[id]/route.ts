import { db } from '@/lib/turso';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const sql = `SELECT id, fen, moves, rating, themes FROM puzzles WHERE id = ?`;
  const args = [id];

  try {
    const result = await db.execute({ sql, args });

    if (!result.rows.length) {
      return Response.json({ error: 'Puzzle not found' }, { status: 404 });
    }

    const row = result.rows[0];
    const allMoves = (row.moves as string).split(' ');

    return Response.json({
      id:           row.id,
      fen:          row.fen,
      rating:       row.rating,
      themes:       (row.themes as string).split(' '),
      opponentMove: allMoves[0],
      solution:     allMoves.slice(1),
    });

  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

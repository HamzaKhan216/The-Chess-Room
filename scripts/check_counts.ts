import { db } from '../src/lib/turso';

async function checkCounts() {
  try {
    const r1 = await db.execute("SELECT count(*) as count FROM puzzles WHERE rating BETWEEN 1050 AND 1350");
    console.log("Puzzles in 1050-1350 range:", r1.rows[0].count);

    const r2 = await db.execute("SELECT count(*) as count FROM puzzles WHERE rating BETWEEN 1050 AND 1350 AND themes LIKE '%oneMove%'");
    console.log("Puzzles in 1050-1350 range with oneMove theme:", r2.rows[0].count);

    const r3 = await db.execute("SELECT count(*) as count FROM puzzles");
    console.log("Total puzzles:", r3.rows[0].count);
  } catch (err) {
    console.error(err);
  }
}

checkCounts();

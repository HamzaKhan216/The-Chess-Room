import { db } from '../src/lib/turso';

async function checkExplain() {
  try {
    const query = "EXPLAIN QUERY PLAN SELECT id FROM puzzles WHERE rating BETWEEN 1050 AND 1350 AND popularity > 0 AND themes LIKE '%oneMove%' LIMIT 5000";
    const result = await db.execute(query);
    console.log("Query Plan:");
    result.rows.forEach(row => {
      console.log(row.detail);
    });
  } catch (err) {
    console.error(err);
  }
}

checkExplain();

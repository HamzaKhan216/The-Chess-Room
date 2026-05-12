import { db } from '../src/lib/turso';

async function checkSchema() {
  try {
    const result = await db.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='puzzles'");
    console.log("Table Schema:");
    console.log(result.rows[0]?.sql);

    const indexResult = await db.execute("SELECT name, sql FROM sqlite_master WHERE type='index' AND tbl_name='puzzles'");
    console.log("\nIndices:");
    indexResult.rows.forEach(row => {
      console.log(`${row.name}: ${row.sql}`);
    });
  } catch (err) {
    console.error(err);
  }
}

checkSchema();

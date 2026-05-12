import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function check() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
  });

  console.log('Checking indexes...');
  const indexes = await client.execute("SELECT name, sql FROM sqlite_master WHERE type='index' AND tbl_name='puzzles'");
  console.log(JSON.stringify(indexes.rows, null, 2));

  console.log('\nChecking table count...');
  const count = await client.execute("SELECT COUNT(*) as count FROM puzzles");
  console.log('Total puzzles:', count.rows[0].count);

  console.log('\nChecking some stats for rating ranges...');
  const stats = await client.execute("SELECT rating, count(*) FROM puzzles GROUP BY rating / 100 LIMIT 10");
  console.log(JSON.stringify(stats.rows, null, 2));
}

check().catch(console.error);

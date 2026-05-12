import { createClient } from '@libsql/client';
import fs from 'fs';
import readline from 'readline';
import path from 'path';

// Use the path provided by the user
const TURSO_DIR = 'D:\\Hamza\\Programs\\Anti Gravity\\Chess analyzer\\Turso';
const CSV_FILE = path.join(TURSO_DIR, 'lichess_db_puzzle.csv');

// Load env variables manually if not using --env-file flag
const dbUrl = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!dbUrl) {
  console.error('❌ Error: TURSO_DATABASE_URL is not defined in environment variables.');
  console.log('Try running with: node --env-file=.env import-puzzles.mjs');
  process.exit(1);
}

const client = createClient({
  url: dbUrl,
  authToken: authToken
});

// ── Filters — tune these to control what gets imported ──
const MIN_POPULARITY       = 50;   // -100 to 100, skip disliked puzzles
const MAX_RATING_DEVIATION = 100;  // skip puzzles with uncertain ratings
const MAX_PUZZLES          = 1_500_000; // 1.5M safely fits in 9GB free tier
const BATCH_SIZE           = 200;  // Turso handles 200-row batches well

async function setupTable() {
  console.log('🛠 Checking/Creating puzzles table...');
  await client.execute(`
    CREATE TABLE IF NOT EXISTS puzzles (
      id               TEXT PRIMARY KEY,
      fen              TEXT NOT NULL,
      moves            TEXT NOT NULL,
      rating           INT NOT NULL,
      rating_deviation INT,
      popularity       INT,
      nb_plays         INT,
      themes           TEXT,
      game_url         TEXT,
      opening_tags     TEXT
    );
  `);
  await client.execute(`CREATE INDEX IF NOT EXISTS idx_rating ON puzzles(rating);`);
  await client.execute(`CREATE INDEX IF NOT EXISTS idx_popularity ON puzzles(popularity);`);
  console.log('✅ Table ready.');
}

async function importPuzzles() {
  if (!fs.existsSync(CSV_FILE)) {
    console.error(`❌ CSV file not found at ${CSV_FILE}`);
    process.exit(1);
  }

  await setupTable();

  const rl = readline.createInterface({
    input: fs.createReadStream(CSV_FILE),
    crlfDelay: Infinity
  });

  let batch = [];
  let imported = 0;
  let skipped  = 0;
  let isHeader = true;

  console.log('🚀 Starting import...');

  for await (const line of rl) {
    if (isHeader) { isHeader = false; continue; }
    if (imported >= MAX_PUZZLES) break;

    const [id, fen, moves, rating, ratingDeviation,
           popularity, nbPlays, themes, gameUrl, openingTags] = line.split(',');

    const pop = parseInt(popularity);
    const dev = parseInt(ratingDeviation);
    const rat = parseInt(rating);

    // Quality filter
    if (isNaN(pop) || pop < MIN_POPULARITY) { skipped++; continue; }
    if (isNaN(dev) || dev > MAX_RATING_DEVIATION) { skipped++; continue; }
    if (isNaN(rat)) { skipped++; continue; }

    batch.push([
      id,
      fen,
      moves,
      rat,
      dev,
      pop,
      parseInt(nbPlays) || 0,
      themes?.trim() || '',
      gameUrl?.trim() || '',
      openingTags?.trim() || ''
    ]);

    if (batch.length === BATCH_SIZE) {
      await insertBatch(batch);
      imported += batch.length;
      batch = [];
      if (imported % 10_000 === 0) {
        console.log(`✅ Imported: ${imported.toLocaleString()} | Skipped: ${skipped.toLocaleString()}`);
      }
    }
  }

  // Insert remainder
  if (batch.length > 0) {
    await insertBatch(batch);
    imported += batch.length;
  }

  console.log(`\n🎉 Done! Imported: ${imported.toLocaleString()} | Skipped: ${skipped.toLocaleString()}`);
  process.exit(0);
}

async function insertBatch(rows) {
  const statements = rows.map(r => ({
    sql: `INSERT OR IGNORE INTO puzzles 
          (id, fen, moves, rating, rating_deviation, popularity, nb_plays, themes, game_url, opening_tags)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: r
  }));

  try {
    await client.batch(statements, 'write');
  } catch (err) {
    console.error('Batch insert error:', err.message);
  }
}

importPuzzles().catch(console.error);

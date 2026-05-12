Full Turso Setup Guide
Step 1 — Install the Turso CLI
bash# Mac
brew install tursodatabase/tap/turso

# Windows (WSL) / Linux
curl -sSfL https://get.tur.so/install.sh | bash
Then log in:
bashturso auth login
# Opens browser, sign up with GitHub — easiest option

Step 2 — Create Your Database
bash# Create the database
turso db create chess-puzzles

# Get your database URL (save this)
turso db show chess-puzzles --url
# outputs something like: libsql://chess-puzzles-yourname.turso.io

# Create an auth token (save this too)
turso db tokens create chess-puzzles

Step 3 — Create the Table
Connect to your DB shell:
bashturso db shell chess-puzzles
Then paste this SQL:
sqlCREATE TABLE puzzles (
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

-- These indexes are critical for fast random puzzle fetching
CREATE INDEX idx_rating     ON puzzles(rating);
CREATE INDEX idx_popularity ON puzzles(popularity);

-- Type .quit to exit
.quit

Step 4 — Download the Lichess Database
Run these on your local machine:
bash# Download (~250MB, takes a few minutes)
curl -O https://database.lichess.org/lichess_db_puzzle.csv.zst

# Decompress — install zstd first if needed
# Mac:
brew install zstd
# Ubuntu/WSL:
sudo apt install zstd

# Then decompress:
zstd -d lichess_db_puzzle.csv.zst
# Produces lichess_db_puzzle.csv (~1.5GB)

Step 5 — Create the Import Script
Install the Turso client:
bashnpm install @libsql/client
Create import-puzzles.js in your project root:
javascriptimport { createClient } from '@libsql/client';
import fs from 'fs';
import readline from 'readline';

const client = createClient({
  url: 'libsql://chess-puzzles-yourname.turso.io', // your URL from Step 2
  authToken: 'your-token-from-step-2'
});

// ── Filters — tune these to control what gets imported ──
const MIN_POPULARITY       = 50;   // -100 to 100, skip disliked puzzles
const MAX_RATING_DEVIATION = 100;  // skip puzzles with uncertain ratings
const MAX_PUZZLES          = 1_500_000; // 1.5M safely fits in 9GB free tier
const BATCH_SIZE           = 200;  // Turso handles 200-row batches well

async function importPuzzles() {
  const rl = readline.createInterface({
    input: fs.createReadStream('lichess_db_puzzle.csv'),
    crlfDelay: Infinity
  });

  let batch = [];
  let imported = 0;
  let skipped  = 0;
  let isHeader = true;

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
  // Turso supports batch transactions — much faster than one-by-one
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
Run it:
bashnode import-puzzles.js
This will take 1–3 hours for 1.5M puzzles. You can cancel and rerun anytime — INSERT OR IGNORE skips already-imported rows safely.

Step 6 — Add Turso to Your Vercel App
In Vercel Dashboard → Your Project → Settings → Environment Variables, add:
TURSO_DATABASE_URL   = libsql://chess-puzzles-yourname.turso.io
TURSO_AUTH_TOKEN     = your-token-from-step-2
And in your local .env.local:
TURSO_DATABASE_URL=libsql://chess-puzzles-yourname.turso.io
TURSO_AUTH_TOKEN=your-token-from-step-2

Step 7 — Create the Shared Client
Create lib/turso.js:
javascriptimport { createClient } from '@libsql/client';

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

Step 8 — Create Your Puzzle API Route
Create app/api/puzzle/route.js (Next.js App Router):
javascriptimport { db } from '@/lib/turso';

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const rating     = parseInt(searchParams.get('rating') || '1200');
  const theme      = searchParams.get('theme') || null;
  const minRating  = rating - 150;
  const maxRating  = rating + 150;

  let sql  = `SELECT id, fen, moves, rating, themes
              FROM puzzles
              WHERE rating BETWEEN ? AND ?
              AND popularity > 0`;
  let args = [minRating, maxRating];

  // Optional theme filter
  // themes are stored as space-separated string e.g. "fork pin middlegame"
  if (theme) {
    sql += ` AND themes LIKE ?`;
    args.push(`%${theme}%`);
  }

  sql += ` ORDER BY RANDOM() LIMIT 1`;

  try {
    const result = await db.execute({ sql, args });

    if (!result.rows.length) {
      return Response.json({ error: 'No puzzle found' }, { status: 404 });
    }

    const row = result.rows[0];
    const allMoves = row.moves.split(' ');

    return Response.json({
      id:           row.id,
      fen:          row.fen,
      rating:       row.rating,
      themes:       row.themes.split(' '),
      opponentMove: allMoves[0],        // auto-play this on board first
      solution:     allMoves.slice(1),  // player must find these
    });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

Step 9 — Test Everything
In your browser or Postman:
GET http://localhost:3000/api/puzzle?rating=1200
GET http://localhost:3000/api/puzzle?rating=1500&theme=fork
GET http://localhost:3000/api/puzzle?rating=800&theme=checkmate_in_1
In Turso shell (to verify import):
bashturso db shell chess-puzzles

-- Count total imported
SELECT COUNT(*) FROM puzzles;

-- Test the random query your API uses
SELECT id, rating, themes FROM puzzles
WHERE rating BETWEEN 1100 AND 1300
ORDER BY RANDOM() LIMIT 3;

Free Tier at a Glance
ResourceTurso FreeYour UsageStorage9 GB~2-3 GB for 1.5M puzzles ✅Rows1 billionWell under ✅Read requests1B/monthFine for most apps ✅Databases500You need 1 ✅Bandwidth50 GB/monthFine ✅
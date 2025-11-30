require('dotenv').config({ path: '.env' });
const sql = require('postgres')(process.env.SWG_POSTGRES_URL);
(async () => {
  try {
    const rows = await sql`SELECT id, text, audio_url FROM words WHERE lower(text) = lower('Patrol')`;
    console.log(rows);
  } finally {
    await sql.end({ timeout: 1 });
  }
})();

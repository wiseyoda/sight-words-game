import "dotenv/config";
import postgres from "postgres";

async function main() {
  const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

  const tables = await sql`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  `;

  console.log("Existing tables in database:");
  if (tables.length === 0) {
    console.log("  (none - database is empty)");
  } else {
    tables.forEach((t) => console.log(`  - ${t.tablename}`));
  }

  await sql.end();
}

main().catch(console.error);

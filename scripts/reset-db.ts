import "dotenv/config";
import postgres from "postgres";

async function main() {
  console.log("Resetting database...\n");

  const connectionString = process.env.SWG_POSTGRES_URL;
  if (!connectionString) {
    throw new Error("SWG_POSTGRES_URL is not set");
  }

  const sql = postgres(connectionString, { ssl: "require" });

  // Get all tables in public schema
  const tables = await sql`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
  `;

  console.log(`Found ${tables.length} existing tables`);

  if (tables.length > 0) {
    // Drop all tables
    console.log("Dropping all tables...");
    for (const table of tables) {
      console.log(`  Dropping: ${table.tablename}`);
      await sql.unsafe(`DROP TABLE IF EXISTS "${table.tablename}" CASCADE`);
    }
    console.log("✓ All tables dropped\n");
  }

  await sql.end();
  console.log("Database reset complete. Ready for fresh schema push.");
}

main().catch((err) => {
  console.error("❌ Reset failed:", err.message);
  process.exit(1);
});

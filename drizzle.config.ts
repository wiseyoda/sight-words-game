import { defineConfig } from "drizzle-kit";

const connectionString = process.env.SWG_POSTGRES_URL;

if (!connectionString) {
  throw new Error("SWG_POSTGRES_URL is not set. Cannot run Drizzle commands without a database URL.");
}

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});

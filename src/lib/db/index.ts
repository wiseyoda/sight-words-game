import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Use the direct postgres connection (not Prisma accelerate URL)
const connectionString = process.env.SWG_POSTGRES_URL!;

// Create postgres client
const client = postgres(connectionString, {
  ssl: "require",
  max: 1, // Limit connections in serverless environment
});

export const db = drizzle(client, { schema });

export * from "./schema";

import "dotenv/config";
import { db, words, themes } from "../src/lib/db";

async function main() {
  console.log("Testing database connection via Drizzle ORM...\n");

  // Test 1: Insert a test word
  console.log("1. Inserting test word...");
  const [testWord] = await db
    .insert(words)
    .values({
      text: "the",
      level: "pre-primer",
    })
    .returning();
  console.log(`   ✓ Created word: "${testWord.text}" (id: ${testWord.id})\n`);

  // Test 2: Query the word back
  console.log("2. Querying words...");
  const allWords = await db.select().from(words);
  console.log(`   ✓ Found ${allWords.length} word(s)\n`);

  // Test 3: Insert a test theme
  console.log("3. Inserting test theme...");
  const [testTheme] = await db
    .insert(themes)
    .values({
      name: "test-theme",
      displayName: "Test Theme",
      palette: {
        primary: "#3b82f6",
        secondary: "#64748b",
        accent: "#f59e0b",
        background: "#f8fafc",
        cardBackground: "#ffffff",
        text: "#0f172a",
        success: "#22c55e",
      },
      feedbackPhrases: {
        correct: ["Great job!"],
        encourage: ["Try again!"],
        celebrate: ["Amazing!"],
      },
    })
    .returning();
  console.log(`   ✓ Created theme: "${testTheme.displayName}"\n`);

  // Test 4: Query themes
  console.log("4. Querying themes...");
  const allThemes = await db.select().from(themes);
  console.log(`   ✓ Found ${allThemes.length} theme(s)\n`);

  console.log("=====================================");
  console.log("✅ All database tests passed!");
  console.log("=====================================");

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Database test failed:", err);
  process.exit(1);
});

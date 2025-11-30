import "dotenv/config";
import { db, words, themes } from "../src/lib/db";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Testing database connection via Drizzle ORM...\n");

  let testWordId: string | null = null;
  let testThemeId: string | null = null;

  // Test 1: Insert a test word
  try {
    console.log("1. Inserting test word...");
    const testWordText = `__test_word_${Date.now()}`;
    const [testWord] = await db
      .insert(words)
      .values({
        text: testWordText,
        type: "custom",
        isSightWord: false,
      })
      .returning();
    testWordId = testWord.id;
    console.log(`   ✓ Created word: "${testWord.text}" (id: ${testWord.id})\n`);

    // Test 2: Query the word back
    console.log("2. Querying words...");
    const allWords = await db.select().from(words);
    console.log(`   ✓ Found ${allWords.length} word(s)\n`);

    // Test 3: Insert a test theme
    console.log("3. Inserting test theme...");
    const themeName = `test-theme-${Date.now()}`;
    const [testTheme] = await db
      .insert(themes)
      .values({
        name: themeName,
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
    testThemeId = testTheme.id;
    console.log(`   ✓ Created theme: "${testTheme.displayName}"\n`);

    // Test 4: Query themes
    console.log("4. Querying themes...");
    const allThemes = await db.select().from(themes);
    console.log(`   ✓ Found ${allThemes.length} theme(s)\n`);

    console.log("=====================================");
    console.log("✅ All database tests passed!");
    console.log("=====================================");
  } finally {
    // Clean up the test records so the script is repeatable
    if (testWordId) {
      await db.delete(words).where(eq(words.id, testWordId));
    }
    if (testThemeId) {
      await db.delete(themes).where(eq(themes.id, testThemeId));
    }
    console.log("\n🧹 Cleaned up test records\n");
  }
}

main().catch((err) => {
  console.error("❌ Database test failed:", err);
  process.exit(1);
});

import "dotenv/config";
import { db } from "../src/lib/db";
import { words } from "../src/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { COMMON_WORD_EMOJIS } from "../src/lib/words/word-types";

/**
 * Add emojis to existing non-sight words that don't have one
 * Only adds emojis to words we have mappings for
 */
async function addEmojis() {
  console.log("🎨 Adding emojis to non-sight words...\n");

  // Get all words that don't have an emoji and are not sight words
  const wordsWithoutEmoji = await db
    .select()
    .from(words)
    .where(
      and(
        isNull(words.emoji),
        eq(words.isSightWord, false)
      )
    );

  console.log(`Found ${wordsWithoutEmoji.length} non-sight words without emojis\n`);

  let updated = 0;
  let skipped = 0;

  for (const word of wordsWithoutEmoji) {
    const emoji = COMMON_WORD_EMOJIS[word.text.toLowerCase()];

    if (emoji) {
      await db
        .update(words)
        .set({ emoji })
        .where(eq(words.id, word.id));

      console.log(`  ✓ ${word.text} → ${emoji}`);
      updated++;
    } else {
      skipped++;
    }
  }

  console.log("\n=====================================");
  console.log("✅ Emoji update complete!");
  console.log("=====================================");
  console.log(`\nSummary:`);
  console.log(`  • ${updated} words updated with emojis`);
  console.log(`  • ${skipped} words skipped (no emoji mapping)`);
}

addEmojis().catch((err) => {
  console.error("❌ Failed to add emojis:", err.message);
  process.exit(1);
});

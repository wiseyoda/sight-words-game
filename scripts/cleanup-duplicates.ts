/**
 * Cleanup script to remove duplicate words and themes from the database
 * Run with: npx tsx scripts/cleanup-duplicates.ts
 */

import { db } from "../src/lib/db";
import { words, themes, wordThemes } from "../src/lib/db/schema";
import { eq, and, inArray, sql } from "drizzle-orm";

async function cleanup() {
  console.log("🧹 Starting database cleanup...\n");

  // 1. Remove duplicate themes (keep the first one with each name)
  console.log("1. Cleaning up duplicate themes...");
  const allThemes = await db.select().from(themes).orderBy(themes.createdAt);
  const seenThemeNames = new Map<string, string>(); // name -> id to keep
  const themeIdMapping = new Map<string, string>(); // old id -> new id (for updating references)

  for (const theme of allThemes) {
    if (seenThemeNames.has(theme.name)) {
      // This is a duplicate - map it to the original
      themeIdMapping.set(theme.id, seenThemeNames.get(theme.name)!);
    } else {
      seenThemeNames.set(theme.name, theme.id);
    }
  }

  const themeIdsToDelete = Array.from(themeIdMapping.keys());

  if (themeIdsToDelete.length > 0) {
    // First, update any campaigns pointing to duplicate themes
    const { campaigns } = await import("../src/lib/db/schema");
    for (const [oldId, newId] of Array.from(themeIdMapping.entries())) {
      await db.update(campaigns).set({ themeId: newId }).where(eq(campaigns.themeId, oldId));
    }
    console.log(`   - Updated campaign references`);

    // Update any word_themes pointing to duplicate themes
    for (const [oldId, newId] of Array.from(themeIdMapping.entries())) {
      await db.update(wordThemes).set({ themeId: newId }).where(eq(wordThemes.themeId, oldId));
    }
    console.log(`   - Updated word-theme references`);

    // Now delete duplicate themes
    await db.delete(themes).where(inArray(themes.id, themeIdsToDelete));
    console.log(`   ✓ Removed ${themeIdsToDelete.length} duplicate themes`);
  } else {
    console.log("   ✓ No duplicate themes found");
  }

  // 2. Remove duplicate words (keep the one with audioUrl, or the first one)
  console.log("\n2. Cleaning up duplicate words...");
  const allWords = await db.select().from(words).orderBy(words.createdAt);
  const wordsByText = new Map<string, typeof allWords>();

  for (const word of allWords) {
    const key = word.text.toLowerCase();
    if (!wordsByText.has(key)) {
      wordsByText.set(key, []);
    }
    wordsByText.get(key)!.push(word);
  }

  let duplicatesRemoved = 0;
  const wordIdsToDelete: string[] = [];

  for (const [text, wordGroup] of Array.from(wordsByText.entries())) {
    if (wordGroup.length > 1) {
      // Sort by: has audioUrl first, then has emoji, then by createdAt
      wordGroup.sort((a: typeof wordGroup[0], b: typeof wordGroup[0]) => {
        if (a.audioUrl && !b.audioUrl) return -1;
        if (!a.audioUrl && b.audioUrl) return 1;
        if (a.emoji && !b.emoji) return -1;
        if (!a.emoji && b.emoji) return 1;
        if (a.isSightWord && !b.isSightWord) return -1;
        if (!a.isSightWord && b.isSightWord) return 1;
        return 0;
      });

      // Keep the first (best) one, delete the rest
      const [keep, ...remove] = wordGroup;
      for (const word of remove) {
        wordIdsToDelete.push(word.id);
        duplicatesRemoved++;
      }
      console.log(`   - "${text}": keeping ${keep.audioUrl ? '(has audio)' : keep.emoji ? '(has emoji)' : '(first)'}, removing ${remove.length} duplicate(s)`);
    }
  }

  if (wordIdsToDelete.length > 0) {
    // First delete any word_themes associations
    await db.delete(wordThemes).where(inArray(wordThemes.wordId, wordIdsToDelete));
    // Then delete the words
    await db.delete(words).where(inArray(words.id, wordIdsToDelete));
    console.log(`\n   ✓ Removed ${duplicatesRemoved} duplicate words`);
  } else {
    console.log("   ✓ No duplicate words found");
  }

  // 3. Summary
  console.log("\n=====================================");
  console.log("✅ Cleanup complete!");
  console.log("=====================================\n");

  const finalWordCount = await db.select({ count: sql<number>`count(*)` }).from(words);
  const finalThemeCount = await db.select({ count: sql<number>`count(*)` }).from(themes);

  console.log(`Final counts:`);
  console.log(`  • ${finalWordCount[0].count} words`);
  console.log(`  • ${finalThemeCount[0].count} themes`);
}

cleanup()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Cleanup failed:", err);
    process.exit(1);
  });

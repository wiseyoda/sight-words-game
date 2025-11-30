/**
 * Associate Paw Patrol words with the paw-patrol theme
 * Run with: npx tsx scripts/associate-paw-patrol-words.ts
 */

import "dotenv/config";
import { db } from "../src/lib/db";
import { words, themes, wordThemes } from "../src/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";

// Words that should be associated with Paw Patrol theme
const pawPatrolWordTexts = [
  // Character names
  "Chase", "Marshall", "Skye", "Rubble", "Rocky", "Zuma", "Ryder", "Humdinger",
  // Story-specific words (lowercase versions too)
  "pup", "pups", "Paw", "Patrol", "Lookout", "Adventure", "Bay",
  "tower", "bridge", "chicken", "cats", "mission", "case", "mess", "mop", "hill",
  // Action words used frequently in Paw Patrol
  "swim", "dig", "fix", "save", "fire", "clean", "work",
  // Theme-specific words
  "fast", "high", "water", "together", "everything", "saved", "trouble",
];

async function associateWords() {
  console.log("🐾 Associating Paw Patrol words with theme...\n");

  // 1. Find the paw-patrol theme
  const pawPatrolTheme = await db.query.themes.findFirst({
    where: eq(themes.name, "paw-patrol"),
  });

  if (!pawPatrolTheme) {
    console.error("❌ Paw Patrol theme not found! Run seed-paw-patrol.ts first.");
    process.exit(1);
  }

  console.log(`Found theme: ${pawPatrolTheme.displayName} (${pawPatrolTheme.id})\n`);

  // 2. Find all matching words (case-insensitive)
  const allWords = await db.select().from(words);
  const pawPatrolWords = allWords.filter((word) =>
    pawPatrolWordTexts.some(
      (text) => word.text.toLowerCase() === text.toLowerCase()
    )
  );

  console.log(`Found ${pawPatrolWords.length} words to associate\n`);

  // 3. Get existing associations
  const existingAssocs = await db
    .select()
    .from(wordThemes)
    .where(eq(wordThemes.themeId, pawPatrolTheme.id));

  const existingWordIds = new Set(existingAssocs.map((a) => a.wordId));
  console.log(`Already associated: ${existingWordIds.size} words`);

  // 4. Create new associations
  let added = 0;
  for (const word of pawPatrolWords) {
    if (!existingWordIds.has(word.id)) {
      try {
        await db.insert(wordThemes).values({
          wordId: word.id,
          themeId: pawPatrolTheme.id,
        });
        console.log(`   + ${word.text}`);
        added++;
      } catch (e) {
        // Might already exist due to unique constraint
      }
    }
  }

  console.log(`\n✅ Added ${added} new word-theme associations`);
  console.log(`Total Paw Patrol word associations: ${existingWordIds.size + added}`);
}

associateWords()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Failed:", err);
    process.exit(1);
  });

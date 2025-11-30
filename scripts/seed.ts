import "dotenv/config";
import { db } from "../src/lib/db";
import { words, themes, campaigns, missions, sentences, wordThemes } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

// ============================================================================
// DOLCH SIGHT WORD LISTS
// Reference: requirements/curriculum/word-lists.md
// ============================================================================

// Pre-Primer Level (40 words)
const prePrimerWords = [
  "a", "and", "away", "big", "blue", "can", "come", "down", "find", "for",
  "funny", "go", "help", "here", "I", "in", "is", "it", "jump", "little",
  "look", "make", "me", "my", "not", "one", "play", "red", "run", "said",
  "see", "the", "three", "to", "two", "up", "we", "where", "yellow", "you"
];

// Primer Level (52 words)
const primerWords = [
  "all", "am", "are", "at", "ate", "be", "black", "brown", "but", "came",
  "did", "do", "eat", "four", "get", "good", "have", "he", "into", "like",
  "must", "new", "no", "now", "on", "our", "out", "please", "pretty", "ran",
  "ride", "saw", "say", "she", "so", "soon", "that", "there", "they", "this",
  "too", "under", "want", "was", "well", "went", "what", "white", "who", "will",
  "with", "yes"
];

// First Grade Level (41 words)
const firstGradeWords = [
  "after", "again", "an", "any", "as", "ask", "by", "could", "every", "fly",
  "from", "give", "going", "had", "has", "her", "him", "his", "how", "just",
  "know", "let", "live", "may", "of", "old", "once", "open", "over", "put",
  "round", "some", "stop", "take", "thank", "them", "then", "think", "walk",
  "were", "when"
];

// ============================================================================
// CUSTOM WORDS (for test sentences - non-sight words, some with emojis)
// ============================================================================

const customWords = [
  { text: "cat", emoji: "🐈" },
  { text: "dog", emoji: "🐕" },
  { text: "bird", emoji: "🐦" },
  { text: "fish", emoji: "🐟" },
  { text: "frog", emoji: "🐸" },
  { text: "ball", emoji: "⚽" },
  { text: "car", emoji: "🚗" },
  { text: "mom", emoji: "👩" },
  { text: "dad", emoji: "👨" },
  // Additional common words with emojis
  { text: "sun", emoji: "☀️" },
  { text: "moon", emoji: "🌙" },
  { text: "star", emoji: "⭐" },
  { text: "tree", emoji: "🌳" },
  { text: "flower", emoji: "🌸" },
  { text: "house", emoji: "🏠" },
  { text: "apple", emoji: "🍎" },
  { text: "banana", emoji: "🍌" },
  { text: "book", emoji: "📖" },
  { text: "happy", emoji: "😊" },
  { text: "sad", emoji: "😢" },
];

// ============================================================================
// DEFAULT THEME
// ============================================================================

const defaultTheme = {
  name: "default",
  displayName: "Adventure",
  palette: {
    primary: "#4F46E5",     // Indigo
    secondary: "#7C3AED",   // Purple
    accent: "#F59E0B",      // Amber
    background: "#F3F4F6",  // Gray-100
    cardBackground: "#FFFFFF",
    text: "#1F2937",        // Gray-800
    success: "#10B981",     // Emerald
  },
  feedbackPhrases: {
    correct: [
      "Great job!",
      "You did it!",
      "Awesome!",
      "Way to go!",
      "Perfect!",
    ],
    encourage: [
      "Try again!",
      "You can do it!",
      "Almost there!",
      "Keep trying!",
    ],
    celebrate: [
      "Amazing work!",
      "You're a star!",
      "Fantastic!",
      "Super reader!",
    ],
  },
};

// ============================================================================
// TEST SENTENCES (10 sentences)
// ============================================================================

const testSentences = [
  {
    text: "The dog can run.",
    orderedWords: ["The", "dog", "can", "run", "."],
    distractors: ["cat", "jump", "big"],
  },
  {
    text: "I see a big cat.",
    orderedWords: ["I", "see", "a", "big", "cat", "."],
    distractors: ["dog", "little", "run"],
  },
  {
    text: "Look at the red ball.",
    orderedWords: ["Look", "at", "the", "red", "ball", "."],
    distractors: ["blue", "see", "car"],
  },
  {
    text: "We can play here.",
    orderedWords: ["We", "can", "play", "here", "."],
    distractors: ["go", "run", "there"],
  },
  {
    text: "The little fish can jump.",
    orderedWords: ["The", "little", "fish", "can", "jump", "."],
    distractors: ["big", "run", "frog"],
  },
  {
    text: "Come and help me.",
    orderedWords: ["Come", "and", "help", "me", "."],
    distractors: ["go", "see", "you"],
  },
  {
    text: "I like my cat.",
    orderedWords: ["I", "like", "my", "cat", "."],
    distractors: ["dog", "see", "the"],
  },
  {
    text: "The bird can fly up.",
    orderedWords: ["The", "bird", "can", "fly", "up", "."],
    distractors: ["down", "run", "dog"],
  },
  {
    text: "Go find the blue car.",
    orderedWords: ["Go", "find", "the", "blue", "car", "."],
    distractors: ["red", "see", "ball"],
  },
  {
    text: "Mom and dad play with me.",
    orderedWords: ["Mom", "and", "dad", "play", "with", "me", "."],
    distractors: ["cat", "run", "see"],
  },
];

// ============================================================================
// SEED FUNCTION
// ============================================================================

// Helper to upsert a word (check if exists, skip if so)
async function upsertWord(wordData: {
  text: string;
  type: string;
  isSightWord: boolean;
  isCharacterWord?: boolean;
  emoji?: string;
}) {
  const existing = await db.query.words.findFirst({
    where: eq(words.text, wordData.text.toLowerCase()),
  });
  if (!existing) {
    await db.insert(words).values({
      text: wordData.text.toLowerCase(),
      type: wordData.type,
      isSightWord: wordData.isSightWord,
      isCharacterWord: wordData.isCharacterWord ?? false,
      emoji: wordData.emoji,
    });
    return true;
  }
  return false;
}

async function seed() {
  console.log("🌱 Seeding database...\n");

  // 1. Seed Pre-Primer words (40 words) - sight words
  console.log("1. Seeding Pre-Primer sight words...");
  let added = 0;
  for (const word of prePrimerWords) {
    if (await upsertWord({ text: word, type: "pre-primer", isSightWord: true })) {
      added++;
    }
  }
  console.log(`   ✓ Added ${added} pre-primer words (${prePrimerWords.length - added} already existed)\n`);

  // 2. Seed Primer words (52 words) - sight words
  console.log("2. Seeding Primer sight words...");
  added = 0;
  for (const word of primerWords) {
    if (await upsertWord({ text: word, type: "primer", isSightWord: true })) {
      added++;
    }
  }
  console.log(`   ✓ Added ${added} primer words (${primerWords.length - added} already existed)\n`);

  // 3. Seed First Grade words (41 words) - sight words
  console.log("3. Seeding First Grade sight words...");
  added = 0;
  for (const word of firstGradeWords) {
    if (await upsertWord({ text: word, type: "first-grade", isSightWord: true })) {
      added++;
    }
  }
  console.log(`   ✓ Added ${added} first-grade words (${firstGradeWords.length - added} already existed)\n`);

  // 4. Seed custom words (non-sight words, some with emojis)
  console.log("4. Seeding custom words with emojis...");
  added = 0;
  for (const word of customWords) {
    if (await upsertWord({ text: word.text, type: "custom", isSightWord: false, emoji: word.emoji })) {
      added++;
    }
  }
  console.log(`   ✓ Added ${added} custom words (${customWords.length - added} already existed)\n`);

  // 5. Seed default theme (upsert by name)
  console.log("5. Creating default theme...");
  let theme = await db.query.themes.findFirst({
    where: eq(themes.name, defaultTheme.name),
  });
  if (!theme) {
    [theme] = await db.insert(themes).values(defaultTheme).returning();
    console.log(`   ✓ Created theme: ${theme.displayName}\n`);
  } else {
    console.log(`   ✓ Theme "${theme.displayName}" already exists\n`);
  }

  // 6. Create a test campaign
  console.log("6. Creating test campaign...");
  const [campaign] = await db.insert(campaigns).values({
    title: "Adventure Begins",
    synopsis: "Help the heroes learn their first words!",
    themeId: theme.id,
    order: 1,
  }).returning();
  console.log(`   ✓ Created campaign: ${campaign.title}\n`);

  // 7. Create a test mission
  console.log("7. Creating test mission...");
  const [mission] = await db.insert(missions).values({
    title: "First Steps",
    type: "play",
    narrativeIntro: "Welcome, young reader! Let's build some sentences together.",
    narrativeOutro: "Amazing! You're already reading like a champion!",
    campaignId: campaign.id,
    order: 1,
    scaffoldingLevel: 1,
  }).returning();
  console.log(`   ✓ Created mission: ${mission.title}\n`);

  // 8. Seed test sentences
  console.log("8. Seeding test sentences...");
  for (let i = 0; i < testSentences.length; i++) {
    const sentence = testSentences[i];
    await db.insert(sentences).values({
      text: sentence.text,
      orderedWords: sentence.orderedWords,
      distractors: sentence.distractors,
      missionId: mission.id,
      order: i + 1,
    });
  }
  console.log(`   ✓ Added ${testSentences.length} test sentences\n`);

  console.log("=====================================");
  console.log("✅ Database seeded successfully!");
  console.log("=====================================");
  const totalSightWords = prePrimerWords.length + primerWords.length + firstGradeWords.length;
  const totalWords = totalSightWords + customWords.length;
  console.log(`\nSummary:`);
  console.log(`  • ${totalWords} words total`);
  console.log(`    - ${prePrimerWords.length} pre-primer sight words`);
  console.log(`    - ${primerWords.length} primer sight words`);
  console.log(`    - ${firstGradeWords.length} first-grade sight words`);
  console.log(`    - ${customWords.length} custom words (with emojis)`);
  console.log(`  • 1 theme (${theme.displayName})`);
  console.log(`  • 1 campaign (${campaign.title})`);
  console.log(`  • 1 mission (${mission.title})`);
  console.log(`  • ${testSentences.length} sentences`);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});

import "dotenv/config";
import { db } from "../src/lib/db";
import { words, themes, campaigns, missions, sentences } from "../src/lib/db/schema";

// ============================================================================
// PRE-PRIMER WORD LIST (40 words)
// ============================================================================

const prePrimerWords = [
  "a", "and", "away", "big", "blue", "can", "come", "down", "find", "for",
  "funny", "go", "help", "here", "I", "in", "is", "it", "jump", "little",
  "look", "make", "me", "my", "not", "one", "play", "red", "run", "said",
  "see", "the", "three", "to", "two", "up", "we", "where", "yellow", "you"
];

// ============================================================================
// PICTURED WORDS (for test sentences)
// ============================================================================

const picturedWords = [
  "cat", "dog", "bird", "fish", "frog", "ball", "car", "mom", "dad"
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

async function seed() {
  console.log("🌱 Seeding database...\n");

  // 1. Seed Pre-Primer words
  console.log("1. Seeding Pre-Primer words...");
  for (const word of prePrimerWords) {
    await db.insert(words).values({
      text: word,
      level: "pre-primer",
    }).onConflictDoNothing();
  }
  console.log(`   ✓ Added ${prePrimerWords.length} pre-primer words\n`);

  // 2. Seed pictured words (as custom level)
  console.log("2. Seeding pictured words...");
  for (const word of picturedWords) {
    await db.insert(words).values({
      text: word,
      level: "pictured",
    }).onConflictDoNothing();
  }
  console.log(`   ✓ Added ${picturedWords.length} pictured words\n`);

  // 3. Seed default theme
  console.log("3. Creating default theme...");
  const [theme] = await db.insert(themes).values(defaultTheme).returning();
  console.log(`   ✓ Created theme: ${theme.displayName}\n`);

  // 4. Create a test campaign
  console.log("4. Creating test campaign...");
  const [campaign] = await db.insert(campaigns).values({
    title: "Adventure Begins",
    synopsis: "Help the heroes learn their first words!",
    themeId: theme.id,
    order: 1,
  }).returning();
  console.log(`   ✓ Created campaign: ${campaign.title}\n`);

  // 5. Create a test mission
  console.log("5. Creating test mission...");
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

  // 6. Seed test sentences
  console.log("6. Seeding test sentences...");
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
  console.log(`\nSummary:`);
  console.log(`  • ${prePrimerWords.length + picturedWords.length} words`);
  console.log(`  • 1 theme (${theme.displayName})`);
  console.log(`  • 1 campaign (${campaign.title})`);
  console.log(`  • 1 mission (${mission.title})`);
  console.log(`  • ${testSentences.length} sentences`);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});

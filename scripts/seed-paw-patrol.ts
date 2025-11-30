import "dotenv/config";
import { db } from "../src/lib/db";
import { words, themes, campaigns, missions, sentences, players } from "../src/lib/db/schema";
import type { ThemePalette, ThemeAssets, ThemeCharacter, FeedbackPhrases, UnlockReward } from "../src/lib/db/schema";

// ============================================================================
// PAW PATROL THEME DATA
// ============================================================================

const pawPatrolPalette: ThemePalette = {
  primary: "#0066CC",      // Paw Patrol blue
  secondary: "#FF6B35",    // Orange accent
  accent: "#FFD700",       // Gold highlights
  background: "#87CEEB",   // Sky blue
  cardBackground: "#FFFFFF",
  text: "#1A1A2E",         // Dark text
  success: "#4CAF50",      // Green correct
  special: "#FFD700",      // Character card gold
};

const pawPatrolAssets: ThemeAssets = {
  logo: "/themes/paw-patrol/logo.png",
  background: "/themes/paw-patrol/background.png",
  mapBackground: "/themes/paw-patrol/map-bg.png",
};

const pawPatrolCharacters: ThemeCharacter[] = [
  {
    id: "chase",
    name: "Chase",
    imageUrl: "/themes/paw-patrol/characters/chase.png",
    thumbnailUrl: "/themes/paw-patrol/characters/chase-thumb.png",
    vocabulary: ["help", "stop", "go", "run", "find"],
  },
  {
    id: "marshall",
    name: "Marshall",
    imageUrl: "/themes/paw-patrol/characters/marshall.png",
    thumbnailUrl: "/themes/paw-patrol/characters/marshall-thumb.png",
    vocabulary: ["help", "fire", "water", "run", "fast"],
  },
  {
    id: "skye",
    name: "Skye",
    imageUrl: "/themes/paw-patrol/characters/skye.png",
    thumbnailUrl: "/themes/paw-patrol/characters/skye-thumb.png",
    vocabulary: ["fly", "up", "high", "go", "see"],
  },
  {
    id: "rubble",
    name: "Rubble",
    imageUrl: "/themes/paw-patrol/characters/rubble.png",
    thumbnailUrl: "/themes/paw-patrol/characters/rubble-thumb.png",
    vocabulary: ["dig", "big", "make", "can", "run"],
  },
  {
    id: "rocky",
    name: "Rocky",
    imageUrl: "/themes/paw-patrol/characters/rocky.png",
    thumbnailUrl: "/themes/paw-patrol/characters/rocky-thumb.png",
    vocabulary: ["fix", "make", "can", "help", "good"],
  },
  {
    id: "zuma",
    name: "Zuma",
    imageUrl: "/themes/paw-patrol/characters/zuma.png",
    thumbnailUrl: "/themes/paw-patrol/characters/zuma-thumb.png",
    vocabulary: ["swim", "water", "go", "help", "save"],
  },
];

const pawPatrolFeedback: FeedbackPhrases = {
  correct: [
    "Paw-some!",
    "Great job, pup!",
    "You're on the case!",
    "No job too big, no pup too small!",
    "Ryder's gonna love this!",
  ],
  encourage: [
    "Almost there, pup!",
    "Try again, you've got this!",
    "So close!",
    "Keep going, brave pup!",
  ],
  celebrate: [
    "Mission complete!",
    "Adventure Bay is saved!",
    "You're a real Paw Patrol hero!",
    "Whenever you're in trouble, just yelp for help!",
  ],
};

// ============================================================================
// MISSION DEFINITIONS
// ============================================================================

interface MissionData {
  title: string;
  type: "play" | "treasure" | "boss";
  narrativeIntro: string;
  narrativeOutro: string;
  scaffoldingLevel: number;
  unlockReward?: UnlockReward;
  sentences: {
    text: string;
    orderedWords: string[];
    distractors: string[];
  }[];
}

const pawPatrolMissions: MissionData[] = [
  // Mission 1: Chase to the Rescue
  {
    title: "Chase to the Rescue",
    type: "play",
    narrativeIntro: "Uh oh! A kitten is stuck in a tree! Chase needs YOUR help to save it!",
    narrativeOutro: "You did it! The kitten is safe! Chase says THANK YOU!",
    scaffoldingLevel: 1,
    unlockReward: { type: "sticker", id: "chase-badge", name: "Chase Badge" },
    sentences: [
      { text: "Chase can help.", orderedWords: ["Chase", "can", "help", "."], distractors: ["run", "go", "see"] },
      { text: "The cat is up.", orderedWords: ["The", "cat", "is", "up", "."], distractors: ["down", "here", "big"] },
      { text: "Chase said go!", orderedWords: ["Chase", "said", "go", "!"], distractors: ["run", "help", "the"] },
    ],
  },
  // Mission 2: Marshall's Fire Drill
  {
    title: "Marshall's Fire Drill",
    type: "play",
    narrativeIntro: "Marshall is practicing for a fire drill! Help him get the words in order!",
    narrativeOutro: "Woohoo! Marshall passed the drill! Great teamwork!",
    scaffoldingLevel: 1,
    sentences: [
      { text: "Marshall can run.", orderedWords: ["Marshall", "can", "run", "."], distractors: ["go", "help", "fast"] },
      { text: "Run to help.", orderedWords: ["Run", "to", "help", "."], distractors: ["go", "see", "the"] },
      { text: "The pup is fast.", orderedWords: ["The", "pup", "is", "fast", "."], distractors: ["big", "run", "can"] },
    ],
  },
  // Mission 3: Skye's Sky High
  {
    title: "Skye's Sky High",
    type: "play",
    narrativeIntro: "Skye needs to fly up high to see Adventure Bay! Help her take off!",
    narrativeOutro: "This pup's gotta fly! Great reading!",
    scaffoldingLevel: 1,
    unlockReward: { type: "sticker", id: "star-sticker", name: "Star Sticker" },
    sentences: [
      { text: "Skye can fly.", orderedWords: ["Skye", "can", "fly", "."], distractors: ["run", "go", "see"] },
      { text: "Go up high.", orderedWords: ["Go", "up", "high", "."], distractors: ["down", "run", "fly"] },
      { text: "I see the pup.", orderedWords: ["I", "see", "the", "pup", "."], distractors: ["can", "go", "here"] },
    ],
  },
  // Mission 4: Rubble on the Double
  {
    title: "Rubble on the Double",
    type: "play",
    narrativeIntro: "Rubble needs to dig a new path! The words will help him build it!",
    narrativeOutro: "Rubble on the double! You built an amazing path!",
    scaffoldingLevel: 2,
    sentences: [
      { text: "Rubble can dig.", orderedWords: ["Rubble", "can", "dig", "."], distractors: ["run", "go", "big"] },
      { text: "Make a big one.", orderedWords: ["Make", "a", "big", "one", "."], distractors: ["little", "the", "can"] },
      { text: "The dog can help.", orderedWords: ["The", "dog", "can", "help", "."], distractors: ["cat", "run", "go"] },
      { text: "We go down.", orderedWords: ["We", "go", "down", "."], distractors: ["up", "run", "can"] },
    ],
  },
  // Mission 5: Rocky Recycles
  {
    title: "Rocky Recycles",
    type: "play",
    narrativeIntro: "Rocky found mixed-up recycling! Sort the words to help him clean up!",
    narrativeOutro: "Don't lose it, reuse it! Great job recycling those words!",
    scaffoldingLevel: 2,
    unlockReward: { type: "minigame", id: "word-bingo", name: "Word Bingo" },
    sentences: [
      { text: "Rocky can fix it.", orderedWords: ["Rocky", "can", "fix", "it", "."], distractors: ["make", "run", "go"] },
      { text: "Make it good.", orderedWords: ["Make", "it", "good", "."], distractors: ["big", "can", "the"] },
      { text: "The pup said yes.", orderedWords: ["The", "pup", "said", "yes", "."], distractors: ["no", "can", "go"] },
      { text: "We can help.", orderedWords: ["We", "can", "help", "."], distractors: ["go", "run", "see"] },
    ],
  },
  // Mission 6: Zuma's Water Rescue
  {
    title: "Zuma's Water Rescue",
    type: "play",
    narrativeIntro: "Someone's stuck in the water! Zuma needs your word power to save them!",
    narrativeOutro: "Let's dive in! You're a true water rescue hero!",
    scaffoldingLevel: 2,
    unlockReward: { type: "sticker", id: "zuma-sticker", name: "Zuma Sticker" },
    sentences: [
      { text: "Zuma can swim.", orderedWords: ["Zuma", "can", "swim", "."], distractors: ["run", "fly", "go"] },
      { text: "Go in the water.", orderedWords: ["Go", "in", "the", "water", "."], distractors: ["up", "to", "can"] },
      { text: "Help is here.", orderedWords: ["Help", "is", "here", "."], distractors: ["go", "can", "the"] },
      { text: "We save the day.", orderedWords: ["We", "save", "the", "day", "."], distractors: ["can", "go", "help"] },
    ],
  },
  // Mission 7: Bridge Builder
  {
    title: "Bridge Builder",
    type: "play",
    narrativeIntro: "The bridge to Farmer Yumi's is broken! Build sentences to fix it piece by piece!",
    narrativeOutro: "The bridge is fixed! Farmer Yumi can get home now!",
    scaffoldingLevel: 2,
    sentences: [
      { text: "We can make it.", orderedWords: ["We", "can", "make", "it", "."], distractors: ["go", "run", "fix"] },
      { text: "The bridge is down.", orderedWords: ["The", "bridge", "is", "down", "."], distractors: ["up", "here", "big"] },
      { text: "Go and help.", orderedWords: ["Go", "and", "help", "."], distractors: ["run", "can", "see"] },
      { text: "Run to see.", orderedWords: ["Run", "to", "see", "."], distractors: ["go", "help", "the"] },
    ],
  },
  // Mission 8: Farmer Yumi's Animals
  {
    title: "Farmer Yumi's Animals",
    type: "play",
    narrativeIntro: "Farmer Yumi's animals ran away! Use words to bring them back!",
    narrativeOutro: "All the animals are back! Farmer Yumi is so happy!",
    scaffoldingLevel: 2,
    unlockReward: { type: "sticker", id: "farmer-yumi", name: "Farmer Yumi Sticker" },
    sentences: [
      { text: "The cat ran away.", orderedWords: ["The", "cat", "ran", "away", "."], distractors: ["dog", "here", "go"] },
      { text: "Find the big dog.", orderedWords: ["Find", "the", "big", "dog", "."], distractors: ["cat", "little", "run"] },
      { text: "Come here, little one.", orderedWords: ["Come", "here", ",", "little", "one", "."], distractors: ["go", "big", "the"] },
      { text: "I see two cats.", orderedWords: ["I", "see", "two", "cats", "."], distractors: ["one", "dog", "the"] },
    ],
  },
  // Mission 9: Mayor's Missing Chickens
  {
    title: "Mayor's Missing Chickens",
    type: "play",
    narrativeIntro: "Chickaletta and her friends are missing! Mayor Goodway needs help!",
    narrativeOutro: "Purr purr purr-urr! Chickaletta is back with Mayor Goodway!",
    scaffoldingLevel: 3,
    unlockReward: { type: "minigame", id: "memory-match", name: "Memory Match" },
    sentences: [
      { text: "Where is the chicken?", orderedWords: ["Where", "is", "the", "chicken", "?"], distractors: ["cat", "go", "here"] },
      { text: "Look under the tree.", orderedWords: ["Look", "under", "the", "tree", "."], distractors: ["up", "here", "go"] },
      { text: "I can find them.", orderedWords: ["I", "can", "find", "them", "."], distractors: ["see", "go", "help"] },
      { text: "They went this way.", orderedWords: ["They", "went", "this", "way", "."], distractors: ["go", "here", "the"] },
      { text: "Run and look.", orderedWords: ["Run", "and", "look", "."], distractors: ["go", "see", "help"] },
    ],
  },
  // Mission 10: Humdinger's Mess
  {
    title: "Humdinger's Mess",
    type: "play",
    narrativeIntro: "Mayor Humdinger made a big mess! Clean up the words to save the town!",
    narrativeOutro: "The mess is cleaned up! But where is Humdinger?",
    scaffoldingLevel: 3,
    unlockReward: { type: "sticker", id: "humdinger", name: "Humdinger Sticker" },
    sentences: [
      { text: "What a big mess.", orderedWords: ["What", "a", "big", "mess", "."], distractors: ["the", "is", "little"] },
      { text: "We must clean up.", orderedWords: ["We", "must", "clean", "up", "."], distractors: ["can", "go", "down"] },
      { text: "Help me, please.", orderedWords: ["Help", "me", ",", "please", "."], distractors: ["go", "the", "can"] },
      { text: "Go get the mop.", orderedWords: ["Go", "get", "the", "mop", "."], distractors: ["run", "can", "help"] },
      { text: "It is all clean now.", orderedWords: ["It", "is", "all", "clean", "now", "."], distractors: ["the", "big", "up"] },
    ],
  },
  // Mission 11: The Lookout Alert
  {
    title: "The Lookout Alert",
    type: "play",
    narrativeIntro: "The Lookout is sending alerts! Decode the messages to help the pups!",
    narrativeOutro: "All pups are ready! Time to face Humdinger!",
    scaffoldingLevel: 3,
    sentences: [
      { text: "Pups, we have a mission.", orderedWords: ["Pups", ",", "we", "have", "a", "mission", "."], distractors: ["the", "go", "can"] },
      { text: "Ryder said to go now.", orderedWords: ["Ryder", "said", "to", "go", "now", "."], distractors: ["run", "help", "the"] },
      { text: "All pups come here.", orderedWords: ["All", "pups", "come", "here", "."], distractors: ["go", "run", "the"] },
      { text: "Look at the big tower.", orderedWords: ["Look", "at", "the", "big", "tower", "."], distractors: ["see", "little", "up"] },
      { text: "We are the Paw Patrol.", orderedWords: ["We", "are", "the", "Paw", "Patrol", "."], distractors: ["is", "a", "can"] },
    ],
  },
  // Mission 12: Road to the Tower
  {
    title: "Road to the Tower",
    type: "play",
    narrativeIntro: "The path to Humdinger's tower is blocked with scrambled words! Clear the way!",
    narrativeOutro: "The path is clear! Time for the final mission!",
    scaffoldingLevel: 3,
    unlockReward: { type: "sticker", id: "ryder", name: "Ryder Sticker" },
    sentences: [
      { text: "We run up the hill.", orderedWords: ["We", "run", "up", "the", "hill", "."], distractors: ["go", "down", "can"] },
      { text: "The tower is here.", orderedWords: ["The", "tower", "is", "here", "."], distractors: ["there", "big", "go"] },
      { text: "Can we go in?", orderedWords: ["Can", "we", "go", "in", "?"], distractors: ["run", "the", "up"] },
      { text: "Yes, we can!", orderedWords: ["Yes", ",", "we", "can", "!"], distractors: ["no", "go", "run"] },
      { text: "Let us save the day.", orderedWords: ["Let", "us", "save", "the", "day", "."], distractors: ["go", "help", "can"] },
    ],
  },
  // Mission 13: Save the Lookout (Boss)
  {
    title: "Save the Lookout",
    type: "boss",
    narrativeIntro: "Mayor Humdinger scrambled all the words in the Lookout! If we don't fix them, the Paw Patrol can't do their job! This is the big one, pup. Are you ready?",
    narrativeOutro: "YOU DID IT! The Lookout is fixed, Humdinger ran away, and Adventure Bay is safe! You're an official member of the Paw Patrol now!",
    scaffoldingLevel: 4,
    unlockReward: { type: "sticker", id: "paw-patrol-champion", name: "Paw Patrol Champion" },
    sentences: [
      { text: "The Lookout is in trouble.", orderedWords: ["The", "Lookout", "is", "in", "trouble", "."], distractors: ["here", "big", "can"] },
      { text: "Humdinger made a mess.", orderedWords: ["Humdinger", "made", "a", "mess", "."], distractors: ["the", "big", "is"] },
      { text: "All pups work together.", orderedWords: ["All", "pups", "work", "together", "."], distractors: ["run", "go", "the"] },
      { text: "We can fix everything.", orderedWords: ["We", "can", "fix", "everything", "."], distractors: ["go", "help", "the"] },
      { text: "Chase is on the case.", orderedWords: ["Chase", "is", "on", "the", "case", "."], distractors: ["go", "run", "help"] },
      { text: "Marshall, fire it up!", orderedWords: ["Marshall", ",", "fire", "it", "up", "!"], distractors: ["go", "run", "the"] },
      { text: "Adventure Bay is saved!", orderedWords: ["Adventure", "Bay", "is", "saved", "!"], distractors: ["the", "we", "can"] },
    ],
  },
];

// ============================================================================
// ADDITIONAL WORDS NEEDED
// ============================================================================

const additionalWords = [
  // Character names
  { text: "Chase", level: "character" },
  { text: "Marshall", level: "character" },
  { text: "Skye", level: "character" },
  { text: "Rubble", level: "character" },
  { text: "Rocky", level: "character" },
  { text: "Zuma", level: "character" },
  { text: "Ryder", level: "character" },
  { text: "Humdinger", level: "character" },
  // Story-specific words
  { text: "pup", level: "paw-patrol" },
  { text: "pups", level: "paw-patrol" },
  { text: "Paw", level: "paw-patrol" },
  { text: "Patrol", level: "paw-patrol" },
  { text: "Lookout", level: "paw-patrol" },
  { text: "Adventure", level: "paw-patrol" },
  { text: "Bay", level: "paw-patrol" },
  { text: "tower", level: "paw-patrol" },
  { text: "bridge", level: "paw-patrol" },
  { text: "chicken", level: "paw-patrol" },
  { text: "cats", level: "paw-patrol" },
  { text: "mission", level: "paw-patrol" },
  { text: "case", level: "paw-patrol" },
  { text: "mess", level: "paw-patrol" },
  { text: "mop", level: "paw-patrol" },
  { text: "hill", level: "paw-patrol" },
  { text: "tree", level: "paw-patrol" },
  // Action words
  { text: "fly", level: "action" },
  { text: "swim", level: "action" },
  { text: "dig", level: "action" },
  { text: "fix", level: "action" },
  { text: "save", level: "action" },
  { text: "fire", level: "action" },
  { text: "clean", level: "action" },
  { text: "work", level: "action" },
  { text: "ran", level: "action" },
  { text: "went", level: "action" },
  { text: "get", level: "action" },
  // Other words
  { text: "fast", level: "adjective" },
  { text: "high", level: "adjective" },
  { text: "under", level: "preposition" },
  { text: "water", level: "noun" },
  { text: "day", level: "noun" },
  { text: "way", level: "noun" },
  { text: "them", level: "pronoun" },
  { text: "this", level: "pronoun" },
  { text: "us", level: "pronoun" },
  { text: "yes", level: "word" },
  { text: "no", level: "word" },
  { text: "now", level: "word" },
  { text: "all", level: "word" },
  { text: "have", level: "word" },
  { text: "are", level: "word" },
  { text: "on", level: "word" },
  { text: "at", level: "word" },
  { text: "must", level: "word" },
  { text: "please", level: "word" },
  { text: "together", level: "word" },
  { text: "everything", level: "word" },
  { text: "saved", level: "word" },
  { text: "trouble", level: "word" },
  { text: "there", level: "word" },
  { text: "What", level: "word" },
  { text: "Where", level: "word" },
  { text: "They", level: "word" },
  { text: "Let", level: "word" },
  { text: "Yes", level: "word" },
  { text: "All", level: "word" },
];

// ============================================================================
// SEED FUNCTION
// ============================================================================

async function seedPawPatrol() {
  console.log("🐾 Seeding Paw Patrol theme data...\n");

  // 1. Seed additional words
  console.log("1. Seeding Paw Patrol words...");
  let wordsAdded = 0;
  for (const word of additionalWords) {
    try {
      await db.insert(words).values({
        text: word.text,
        level: word.level,
      }).onConflictDoNothing();
      wordsAdded++;
    } catch (e) {
      // Word might already exist
    }
  }
  console.log(`   ✓ Processed ${additionalWords.length} words\n`);

  // 2. Create Paw Patrol theme
  console.log("2. Creating Paw Patrol theme...");
  const [theme] = await db.insert(themes).values({
    name: "paw-patrol",
    displayName: "Paw Patrol: Adventure Bay Rescue",
    palette: pawPatrolPalette,
    assets: pawPatrolAssets,
    characters: pawPatrolCharacters,
    feedbackPhrases: pawPatrolFeedback,
    isActive: true,
    isCustom: false,
  }).returning();
  console.log(`   ✓ Created theme: ${theme.displayName}\n`);

  // 3. Create campaign
  console.log("3. Creating Adventure Bay Rescue campaign...");
  const [campaign] = await db.insert(campaigns).values({
    title: "Adventure Bay Rescue",
    synopsis: "Mayor Humdinger has scrambled all the words in Adventure Bay! Join the Paw Patrol to build sentences and save the day!",
    themeId: theme.id,
    order: 1,
    isActive: true,
  }).returning();
  console.log(`   ✓ Created campaign: ${campaign.title}\n`);

  // 4. Create all missions and sentences
  console.log("4. Creating missions and sentences...");
  let totalSentences = 0;

  for (let i = 0; i < pawPatrolMissions.length; i++) {
    const missionData = pawPatrolMissions[i];

    // Create mission
    const [mission] = await db.insert(missions).values({
      title: missionData.title,
      type: missionData.type,
      narrativeIntro: missionData.narrativeIntro,
      narrativeOutro: missionData.narrativeOutro,
      campaignId: campaign.id,
      order: i + 1,
      scaffoldingLevel: missionData.scaffoldingLevel,
      unlockReward: missionData.unlockReward,
      isActive: true,
    }).returning();

    // Create sentences for this mission
    for (let j = 0; j < missionData.sentences.length; j++) {
      const sentenceData = missionData.sentences[j];
      await db.insert(sentences).values({
        text: sentenceData.text,
        orderedWords: sentenceData.orderedWords,
        distractors: sentenceData.distractors,
        missionId: mission.id,
        order: j + 1,
      });
      totalSentences++;
    }

    console.log(`   ✓ Mission ${i + 1}: ${mission.title} (${missionData.sentences.length} sentences)`);
  }
  console.log(`\n   Total: ${pawPatrolMissions.length} missions, ${totalSentences} sentences\n`);

  // 5. Create demo player
  console.log("5. Creating demo player...");
  const firstMission = await db.query.missions.findFirst({
    where: (m, { eq, and }) => and(
      eq(m.campaignId, campaign.id),
      eq(m.order, 1)
    ),
  });

  const [player] = await db.insert(players).values({
    name: "Demo Player",
    avatarId: "pup",
    currentThemeId: theme.id,
    currentCampaignId: campaign.id,
    currentMissionId: firstMission?.id,
    totalStars: 0,
    totalPlayTimeSeconds: 0,
  }).returning();
  console.log(`   ✓ Created player: ${player.name}\n`);

  // Summary
  console.log("=====================================");
  console.log("🐾 Paw Patrol theme seeded successfully!");
  console.log("=====================================");
  console.log(`\nSummary:`);
  console.log(`  • ${additionalWords.length} words added`);
  console.log(`  • 1 theme (${theme.displayName})`);
  console.log(`  • 6 characters`);
  console.log(`  • 1 campaign (${campaign.title})`);
  console.log(`  • ${pawPatrolMissions.length} missions`);
  console.log(`  • ${totalSentences} sentences`);
  console.log(`  • 1 demo player`);
  console.log(`\nTheme ID: ${theme.id}`);
  console.log(`Campaign ID: ${campaign.id}`);
  console.log(`Player ID: ${player.id}`);
}

seedPawPatrol().catch((err) => {
  console.error("❌ Paw Patrol seed failed:", err.message);
  console.error(err);
  process.exit(1);
});

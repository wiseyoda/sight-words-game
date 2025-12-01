import "dotenv/config";
import { db } from "../src/lib/db";
import { words, themes, campaigns, missions, sentences } from "../src/lib/db/schema";
import type { ThemePalette, ThemeAssets, ThemeCharacter, FeedbackPhrases, UnlockReward } from "../src/lib/db/schema";

// ============================================================================
// MARVEL AVENGERS THEME DATA
// ============================================================================

const marvelPalette: ThemePalette = {
  primary: "#D62828",      // Avengers red
  secondary: "#1A2D63",    // Deep blue
  accent: "#F6D800",       // Gold/yellow
  background: "#1A1A2E",   // Dark background
  cardBackground: "#2D2D44",
  text: "#FFFFFF",         // White text
  success: "#4CAF50",      // Green correct
  special: "#F6D800",      // Gold for character cards
};

const marvelAssets: ThemeAssets = {
  logo: "/themes/marvel/logo.png",
  background: "/themes/marvel/background.png",
  mapBackground: "/themes/marvel/map-bg.png",
};

const marvelCharacters: ThemeCharacter[] = [
  {
    id: "iron-man",
    name: "Iron Man",
    imageUrl: "/themes/marvel/characters/iron-man.png",
    thumbnailUrl: "/themes/marvel/characters/iron-man-thumb.png",
    vocabulary: ["fly", "fast", "help", "go", "power"],
  },
  {
    id: "captain-america",
    name: "Captain America",
    imageUrl: "/themes/marvel/characters/captain-america.png",
    thumbnailUrl: "/themes/marvel/characters/captain-america-thumb.png",
    vocabulary: ["run", "help", "good", "team", "strong"],
  },
  {
    id: "spider-man",
    name: "Spider-Man",
    imageUrl: "/themes/marvel/characters/spider-man.png",
    thumbnailUrl: "/themes/marvel/characters/spider-man-thumb.png",
    vocabulary: ["jump", "swing", "help", "fast", "go"],
  },
  {
    id: "thor",
    name: "Thor",
    imageUrl: "/themes/marvel/characters/thor.png",
    thumbnailUrl: "/themes/marvel/characters/thor-thumb.png",
    vocabulary: ["strong", "power", "help", "fly", "big"],
  },
  {
    id: "hulk",
    name: "Hulk",
    imageUrl: "/themes/marvel/characters/hulk.png",
    thumbnailUrl: "/themes/marvel/characters/hulk-thumb.png",
    vocabulary: ["strong", "big", "run", "jump", "smash"],
  },
  {
    id: "black-widow",
    name: "Black Widow",
    imageUrl: "/themes/marvel/characters/black-widow.png",
    thumbnailUrl: "/themes/marvel/characters/black-widow-thumb.png",
    vocabulary: ["fast", "run", "help", "good", "go"],
  },
];

const marvelFeedback: FeedbackPhrases = {
  correct: [
    "Avengers assemble!",
    "Super job, hero!",
    "Heroic work!",
    "You've got the power!",
    "Incredible!",
  ],
  encourage: [
    "Heroes never give up!",
    "Try again, warrior!",
    "You can do it!",
    "Keep fighting!",
  ],
  celebrate: [
    "Mission accomplished!",
    "You saved the day!",
    "The world is safe!",
    "You're a true Avenger!",
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

const marvelMissions: MissionData[] = [
  // Mission 1: Iron Man's First Flight
  {
    title: "Iron Man's First Flight",
    type: "play",
    narrativeIntro: "Iron Man needs to test his suit! Help him fly by building sentences!",
    narrativeOutro: "Iron Man is flying! The suit works perfectly!",
    scaffoldingLevel: 1,
    unlockReward: { type: "sticker", id: "arc-reactor", name: "Arc Reactor Badge" },
    sentences: [
      { text: "Iron Man can fly.", orderedWords: ["Iron", "Man", "can", "fly", "."], distractors: ["run", "go", "jump"] },
      { text: "Go up and up!", orderedWords: ["Go", "up", "and", "up", "!"], distractors: ["down", "run", "fly"] },
      { text: "The suit is fast.", orderedWords: ["The", "suit", "is", "fast", "."], distractors: ["big", "good", "here"] },
    ],
  },
  // Mission 2: Cap's Training Day
  {
    title: "Cap's Training Day",
    type: "play",
    narrativeIntro: "Captain America is training new heroes! Join the team!",
    narrativeOutro: "Great training! You're ready to be an Avenger!",
    scaffoldingLevel: 1,
    sentences: [
      { text: "Cap said run here.", orderedWords: ["Cap", "said", "run", "here", "."], distractors: ["go", "jump", "fly"] },
      { text: "We run and jump.", orderedWords: ["We", "run", "and", "jump", "."], distractors: ["go", "fly", "help"] },
      { text: "Help the team.", orderedWords: ["Help", "the", "team", "."], distractors: ["run", "go", "fly"] },
    ],
  },
  // Mission 3: Spider-Man Swings
  {
    title: "Spider-Man Swings",
    type: "play",
    narrativeIntro: "Spider-Man is swinging through the city! Help him save the day!",
    narrativeOutro: "With great power comes great reading!",
    scaffoldingLevel: 1,
    unlockReward: { type: "sticker", id: "web", name: "Web Sticker" },
    sentences: [
      { text: "Spider-Man can swing.", orderedWords: ["Spider-Man", "can", "swing", "."], distractors: ["fly", "run", "jump"] },
      { text: "Go fast and jump.", orderedWords: ["Go", "fast", "and", "jump", "."], distractors: ["run", "fly", "swing"] },
      { text: "I see a bad guy.", orderedWords: ["I", "see", "a", "bad", "guy", "."], distractors: ["good", "big", "the"] },
    ],
  },
  // Mission 4: Thor's Thunder
  {
    title: "Thor's Thunder",
    type: "play",
    narrativeIntro: "Thor needs to summon his hammer! Use the power of words!",
    narrativeOutro: "Thunder and words! You're worthy!",
    scaffoldingLevel: 2,
    sentences: [
      { text: "Thor is so strong.", orderedWords: ["Thor", "is", "so", "strong", "."], distractors: ["big", "fast", "good"] },
      { text: "The hammer can fly.", orderedWords: ["The", "hammer", "can", "fly", "."], distractors: ["run", "go", "swing"] },
      { text: "Power is in you.", orderedWords: ["Power", "is", "in", "you", "."], distractors: ["go", "run", "the"] },
      { text: "We are the heroes.", orderedWords: ["We", "are", "the", "heroes", "."], distractors: ["is", "a", "go"] },
    ],
  },
  // Mission 5: Hulk Smash Words
  {
    title: "Hulk Smash Words",
    type: "play",
    narrativeIntro: "Hulk wants to help! But first, he needs to learn words!",
    narrativeOutro: "Hulk smash... sentences! Great job!",
    scaffoldingLevel: 2,
    unlockReward: { type: "sticker", id: "hulk-fist", name: "Hulk Fist" },
    sentences: [
      { text: "Hulk is very big.", orderedWords: ["Hulk", "is", "very", "big", "."], distractors: ["little", "fast", "good"] },
      { text: "Hulk can run fast.", orderedWords: ["Hulk", "can", "run", "fast", "."], distractors: ["fly", "jump", "swing"] },
      { text: "Smash the bad guys!", orderedWords: ["Smash", "the", "bad", "guys", "!"], distractors: ["good", "big", "run"] },
      { text: "Hulk is a hero too.", orderedWords: ["Hulk", "is", "a", "hero", "too", "."], distractors: ["the", "big", "fast"] },
    ],
  },
  // Mission 6: Black Widow's Mission
  {
    title: "Black Widow's Mission",
    type: "play",
    narrativeIntro: "Black Widow has a secret mission! Be very quiet!",
    narrativeOutro: "Mission complete! You're a master spy!",
    scaffoldingLevel: 2,
    sentences: [
      { text: "We must be quiet.", orderedWords: ["We", "must", "be", "quiet", "."], distractors: ["run", "go", "fast"] },
      { text: "Go in and look.", orderedWords: ["Go", "in", "and", "look", "."], distractors: ["run", "fly", "jump"] },
      { text: "I can find the way.", orderedWords: ["I", "can", "find", "the", "way", "."], distractors: ["go", "run", "see"] },
      { text: "Black Widow is fast.", orderedWords: ["Black", "Widow", "is", "fast", "."], distractors: ["big", "strong", "good"] },
    ],
  },
  // Mission 7: Team Assemble
  {
    title: "Team Assemble",
    type: "play",
    narrativeIntro: "The Avengers need to work together! Assemble the team!",
    narrativeOutro: "The team is ready! Avengers assemble!",
    scaffoldingLevel: 2,
    unlockReward: { type: "minigame", id: "hero-match", name: "Hero Match" },
    sentences: [
      { text: "Call all the heroes.", orderedWords: ["Call", "all", "the", "heroes", "."], distractors: ["run", "go", "help"] },
      { text: "We work as a team.", orderedWords: ["We", "work", "as", "a", "team", "."], distractors: ["go", "run", "the"] },
      { text: "Together we are strong.", orderedWords: ["Together", "we", "are", "strong", "."], distractors: ["is", "big", "good"] },
      { text: "Heroes help everyone.", orderedWords: ["Heroes", "help", "everyone", "."], distractors: ["run", "go", "the"] },
    ],
  },
  // Mission 8: City in Danger
  {
    title: "City in Danger",
    type: "play",
    narrativeIntro: "The city needs help! The Avengers must act fast!",
    narrativeOutro: "The city is safe! Great teamwork!",
    scaffoldingLevel: 3,
    sentences: [
      { text: "The city is in danger.", orderedWords: ["The", "city", "is", "in", "danger", "."], distractors: ["here", "good", "big"] },
      { text: "We must go now.", orderedWords: ["We", "must", "go", "now", "."], distractors: ["run", "fly", "here"] },
      { text: "Help the people.", orderedWords: ["Help", "the", "people", "."], distractors: ["run", "go", "fly"] },
      { text: "Run to the rescue.", orderedWords: ["Run", "to", "the", "rescue", "."], distractors: ["go", "fly", "help"] },
      { text: "We save everyone.", orderedWords: ["We", "save", "everyone", "."], distractors: ["go", "run", "help"] },
    ],
  },
  // Mission 9: The Villain Appears
  {
    title: "The Villain Appears",
    type: "play",
    narrativeIntro: "A villain is causing trouble! The Avengers need your help!",
    narrativeOutro: "The villain ran away! But they'll be back...",
    scaffoldingLevel: 3,
    unlockReward: { type: "sticker", id: "shield", name: "Shield Badge" },
    sentences: [
      { text: "Look at the villain!", orderedWords: ["Look", "at", "the", "villain", "!"], distractors: ["see", "go", "run"] },
      { text: "We must stop them.", orderedWords: ["We", "must", "stop", "them", "."], distractors: ["go", "run", "help"] },
      { text: "Heroes never give up.", orderedWords: ["Heroes", "never", "give", "up", "."], distractors: ["go", "run", "down"] },
      { text: "Fight for what is right.", orderedWords: ["Fight", "for", "what", "is", "right", "."], distractors: ["good", "the", "go"] },
      { text: "Good always wins.", orderedWords: ["Good", "always", "wins", "."], distractors: ["run", "go", "the"] },
    ],
  },
  // Mission 10: The Tower
  {
    title: "The Tower",
    type: "play",
    narrativeIntro: "The villain is at the tower! Climb up to stop them!",
    narrativeOutro: "You made it to the top! Get ready for the final battle!",
    scaffoldingLevel: 3,
    sentences: [
      { text: "Go up the tower.", orderedWords: ["Go", "up", "the", "tower", "."], distractors: ["down", "run", "fly"] },
      { text: "We climb so high.", orderedWords: ["We", "climb", "so", "high", "."], distractors: ["run", "go", "low"] },
      { text: "Look down at the city.", orderedWords: ["Look", "down", "at", "the", "city", "."], distractors: ["up", "see", "go"] },
      { text: "The villain is here.", orderedWords: ["The", "villain", "is", "here", "."], distractors: ["there", "go", "run"] },
      { text: "Time to save the day.", orderedWords: ["Time", "to", "save", "the", "day", "."], distractors: ["go", "run", "help"] },
    ],
  },
  // Mission 11: The Battle Begins
  {
    title: "The Battle Begins",
    type: "play",
    narrativeIntro: "The final battle is starting! Every word counts!",
    narrativeOutro: "The battle is almost won! One more mission!",
    scaffoldingLevel: 3,
    unlockReward: { type: "sticker", id: "star", name: "Hero Star" },
    sentences: [
      { text: "The battle is on.", orderedWords: ["The", "battle", "is", "on", "."], distractors: ["go", "run", "here"] },
      { text: "Use all your power.", orderedWords: ["Use", "all", "your", "power", "."], distractors: ["the", "run", "go"] },
      { text: "Iron Man flies high.", orderedWords: ["Iron", "Man", "flies", "high", "."], distractors: ["run", "go", "low"] },
      { text: "Thor brings the thunder.", orderedWords: ["Thor", "brings", "the", "thunder", "."], distractors: ["go", "run", "here"] },
      { text: "Hulk is very strong.", orderedWords: ["Hulk", "is", "very", "strong", "."], distractors: ["big", "fast", "good"] },
    ],
  },
  // Mission 12: Almost There
  {
    title: "Almost There",
    type: "play",
    narrativeIntro: "The villain is getting weak! Keep going!",
    narrativeOutro: "The villain is defeated! Time for the celebration!",
    scaffoldingLevel: 4,
    sentences: [
      { text: "We are almost there.", orderedWords: ["We", "are", "almost", "there", "."], distractors: ["here", "go", "run"] },
      { text: "One more push.", orderedWords: ["One", "more", "push", "."], distractors: ["go", "run", "the"] },
      { text: "The team works together.", orderedWords: ["The", "team", "works", "together", "."], distractors: ["run", "go", "fast"] },
      { text: "We can do this.", orderedWords: ["We", "can", "do", "this", "."], distractors: ["go", "run", "the"] },
      { text: "Victory is near.", orderedWords: ["Victory", "is", "near", "."], distractors: ["here", "go", "far"] },
    ],
  },
  // Mission 13: Save the World (Boss)
  {
    title: "Save the World",
    type: "boss",
    narrativeIntro: "This is it! The final mission! Every Avenger is counting on you! Use everything you've learned to save the world! AVENGERS ASSEMBLE!",
    narrativeOutro: "YOU DID IT! The world is saved! You're not just a hero - you're an AVENGER! Tony Stark, Steve Rogers, and all the heroes salute you! You proved that with the power of words, anything is possible!",
    scaffoldingLevel: 4,
    unlockReward: { type: "sticker", id: "avenger-champion", name: "Avenger Champion" },
    sentences: [
      { text: "This is the final battle.", orderedWords: ["This", "is", "the", "final", "battle", "."], distractors: ["go", "run", "big"] },
      { text: "All heroes work together.", orderedWords: ["All", "heroes", "work", "together", "."], distractors: ["go", "run", "the"] },
      { text: "Iron Man blasts the villain.", orderedWords: ["Iron", "Man", "blasts", "the", "villain", "."], distractors: ["run", "go", "fly"] },
      { text: "Cap throws his shield.", orderedWords: ["Cap", "throws", "his", "shield", "."], distractors: ["run", "go", "the"] },
      { text: "Spider-Man swings into action.", orderedWords: ["Spider-Man", "swings", "into", "action", "."], distractors: ["run", "go", "fly"] },
      { text: "Thor calls the thunder.", orderedWords: ["Thor", "calls", "the", "thunder", "."], distractors: ["go", "run", "power"] },
      { text: "The world is saved!", orderedWords: ["The", "world", "is", "saved", "!"], distractors: ["go", "run", "here"] },
    ],
  },
];

// ============================================================================
// ADDITIONAL WORDS NEEDED
// ============================================================================

const additionalWords = [
  // Character names - isCharacterWord: true
  { text: "Iron", type: "custom", isCharacterWord: false },
  { text: "Man", type: "custom", isCharacterWord: false },
  { text: "Cap", type: "custom", isCharacterWord: true },
  { text: "Spider-Man", type: "custom", isCharacterWord: true },
  { text: "Thor", type: "custom", isCharacterWord: true },
  { text: "Hulk", type: "custom", isCharacterWord: true },
  { text: "Black", type: "custom", isCharacterWord: false },
  { text: "Widow", type: "custom", isCharacterWord: false },
  // Story-specific words
  { text: "suit", type: "custom" },
  { text: "hammer", type: "custom" },
  { text: "shield", type: "custom" },
  { text: "power", type: "custom" },
  { text: "team", type: "custom" },
  { text: "heroes", type: "custom" },
  { text: "hero", type: "custom" },
  { text: "villain", type: "custom" },
  { text: "battle", type: "custom" },
  { text: "city", type: "custom" },
  { text: "danger", type: "custom" },
  { text: "rescue", type: "custom" },
  { text: "victory", type: "custom" },
  { text: "thunder", type: "custom" },
  { text: "world", type: "custom" },
  { text: "action", type: "custom" },
  { text: "guy", type: "custom" },
  { text: "guys", type: "custom" },
  // Action words
  { text: "swing", type: "custom" },
  { text: "swings", type: "custom" },
  { text: "smash", type: "custom" },
  { text: "fight", type: "custom" },
  { text: "call", type: "custom" },
  { text: "calls", type: "custom" },
  { text: "climb", type: "custom" },
  { text: "stop", type: "custom" },
  { text: "give", type: "custom" },
  { text: "wins", type: "custom" },
  { text: "use", type: "custom" },
  { text: "push", type: "custom" },
  { text: "brings", type: "custom" },
  { text: "blasts", type: "custom" },
  { text: "throws", type: "custom" },
  { text: "flies", type: "custom" },
  { text: "works", type: "custom" },
  // Descriptive words
  { text: "strong", type: "custom" },
  { text: "quiet", type: "custom" },
  { text: "bad", type: "custom" },
  { text: "final", type: "custom" },
  { text: "near", type: "custom" },
  { text: "almost", type: "custom" },
  { text: "never", type: "custom" },
  { text: "always", type: "custom" },
  { text: "right", type: "custom" },
  { text: "your", type: "custom" },
  { text: "his", type: "custom" },
  { text: "into", type: "custom" },
  { text: "as", type: "custom" },
  { text: "Time", type: "custom" },
  { text: "One", type: "custom" },
  { text: "Use", type: "custom" },
  { text: "Victory", type: "custom" },
];

// ============================================================================
// SEED FUNCTION
// ============================================================================

async function seedMarvel() {
  console.log("🦸 Seeding Marvel theme data...\n");

  // 1. Seed additional words
  console.log("1. Seeding Marvel words...");
  for (const word of additionalWords) {
    try {
      await db.insert(words).values({
        text: word.text,
        type: word.type,
        isSightWord: false,
        isCharacterWord: word.isCharacterWord || false,
      }).onConflictDoNothing();
    } catch (e) {
      // Word might already exist
    }
  }
  console.log(`   ✓ Processed ${additionalWords.length} words\n`);

  // 2. Create Marvel theme
  console.log("2. Creating Marvel theme...");
  const [theme] = await db.insert(themes).values({
    name: "marvel",
    displayName: "Marvel: Word Warriors",
    palette: marvelPalette,
    assets: marvelAssets,
    characters: marvelCharacters,
    feedbackPhrases: marvelFeedback,
    isActive: true,
    isCustom: false,
  }).returning();
  console.log(`   ✓ Created theme: ${theme.displayName}\n`);

  // 3. Create campaign
  console.log("3. Creating Word Warriors campaign...");
  const [campaign] = await db.insert(campaigns).values({
    title: "Word Warriors",
    synopsis: "Join the Avengers to save the world! Build sentences with your favorite heroes and defeat the villain!",
    themeId: theme.id,
    order: 1,
    isActive: true,
  }).returning();
  console.log(`   ✓ Created campaign: ${campaign.title}\n`);

  // 4. Create all missions and sentences
  console.log("4. Creating missions and sentences...");
  let totalSentences = 0;

  for (let i = 0; i < marvelMissions.length; i++) {
    const missionData = marvelMissions[i];

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
  console.log(`\n   Total: ${marvelMissions.length} missions, ${totalSentences} sentences\n`);

  // Summary
  console.log("=====================================");
  console.log("🦸 Marvel theme seeded successfully!");
  console.log("=====================================");
  console.log(`\nSummary:`);
  console.log(`  • ${additionalWords.length} words added`);
  console.log(`  • 1 theme (${theme.displayName})`);
  console.log(`  • 6 characters`);
  console.log(`  • 1 campaign (${campaign.title})`);
  console.log(`  • ${marvelMissions.length} missions`);
  console.log(`  • ${totalSentences} sentences`);
  console.log(`\nTheme ID: ${theme.id}`);
  console.log(`Campaign ID: ${campaign.id}`);
}

seedMarvel()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Marvel seed failed:", err.message);
    console.error(err);
    process.exit(1);
  });

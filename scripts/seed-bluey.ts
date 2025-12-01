import "dotenv/config";
import { db } from "../src/lib/db";
import { words, themes, campaigns, missions, sentences } from "../src/lib/db/schema";
import type { ThemePalette, ThemeAssets, ThemeCharacter, FeedbackPhrases, UnlockReward } from "../src/lib/db/schema";

// ============================================================================
// BLUEY THEME DATA
// ============================================================================

const blueyPalette: ThemePalette = {
  primary: "#5B9BD5",      // Bluey's fur blue
  secondary: "#F6A84B",    // Bingo's orange
  accent: "#7EC8A3",       // Grass green
  background: "#E8F4FC",   // Light sky blue
  cardBackground: "#FFFFFF",
  text: "#2D3748",         // Dark text
  success: "#68D391",      // Soft green
  special: "#F6A84B",      // Bingo orange for character cards
};

const blueyAssets: ThemeAssets = {
  logo: "/themes/bluey/logo.png",
  background: "/themes/bluey/background.png",
  mapBackground: "/themes/bluey/map-bg.png",
};

const blueyCharacters: ThemeCharacter[] = [
  {
    id: "bluey",
    name: "Bluey",
    imageUrl: "/themes/bluey/characters/bluey.png",
    thumbnailUrl: "/themes/bluey/characters/bluey-thumb.png",
    vocabulary: ["play", "fun", "go", "run", "jump"],
  },
  {
    id: "bingo",
    name: "Bingo",
    imageUrl: "/themes/bluey/characters/bingo.png",
    thumbnailUrl: "/themes/bluey/characters/bingo-thumb.png",
    vocabulary: ["look", "come", "play", "help", "see"],
  },
  {
    id: "bandit",
    name: "Bandit",
    imageUrl: "/themes/bluey/characters/bandit.png",
    thumbnailUrl: "/themes/bluey/characters/bandit-thumb.png",
    vocabulary: ["come", "go", "play", "good", "look"],
  },
  {
    id: "chilli",
    name: "Chilli",
    imageUrl: "/themes/bluey/characters/chilli.png",
    thumbnailUrl: "/themes/bluey/characters/chilli-thumb.png",
    vocabulary: ["love", "come", "good", "help", "play"],
  },
  {
    id: "muffin",
    name: "Muffin",
    imageUrl: "/themes/bluey/characters/muffin.png",
    thumbnailUrl: "/themes/bluey/characters/muffin-thumb.png",
    vocabulary: ["want", "play", "run", "no", "yes"],
  },
  {
    id: "socks",
    name: "Socks",
    imageUrl: "/themes/bluey/characters/socks.png",
    thumbnailUrl: "/themes/bluey/characters/socks-thumb.png",
    vocabulary: ["play", "run", "jump", "go", "fun"],
  },
];

const blueyFeedback: FeedbackPhrases = {
  correct: [
    "For real life!",
    "Wackadoo!",
    "Good one, mate!",
    "Hooray!",
    "Brilliant!",
  ],
  encourage: [
    "Have another go!",
    "You can do it!",
    "Almost there!",
    "Keep trying!",
  ],
  celebrate: [
    "This is the best game ever!",
    "You did it, legend!",
    "Time for a victory dance!",
    "Mum and Dad will be so proud!",
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

const blueyMissions: MissionData[] = [
  // Mission 1: Keepy Uppy
  {
    title: "Keepy Uppy",
    type: "play",
    narrativeIntro: "Let's play Keepy Uppy! Build sentences to keep the balloon in the air!",
    narrativeOutro: "The balloon stayed up! Great game!",
    scaffoldingLevel: 1,
    unlockReward: { type: "sticker", id: "balloon", name: "Balloon Sticker" },
    sentences: [
      { text: "Bluey can play.", orderedWords: ["Bluey", "can", "play", "."], distractors: ["run", "go", "jump"] },
      { text: "Go up and up!", orderedWords: ["Go", "up", "and", "up", "!"], distractors: ["down", "run", "play"] },
      { text: "We play a fun game.", orderedWords: ["We", "play", "a", "fun", "game", "."], distractors: ["run", "go", "jump"] },
    ],
  },
  // Mission 2: The Creek
  {
    title: "The Creek",
    type: "play",
    narrativeIntro: "Bluey and Bingo are at the creek! Help them explore with your words!",
    narrativeOutro: "What an adventure at the creek!",
    scaffoldingLevel: 1,
    sentences: [
      { text: "Bingo can jump.", orderedWords: ["Bingo", "can", "jump", "."], distractors: ["run", "play", "go"] },
      { text: "Look at the water.", orderedWords: ["Look", "at", "the", "water", "."], distractors: ["run", "go", "play"] },
      { text: "We run and play.", orderedWords: ["We", "run", "and", "play", "."], distractors: ["go", "jump", "look"] },
    ],
  },
  // Mission 3: Backyard Games
  {
    title: "Backyard Games",
    type: "play",
    narrativeIntro: "Time for backyard games with Bandit! What will we play?",
    narrativeOutro: "Best backyard day ever!",
    scaffoldingLevel: 1,
    unlockReward: { type: "sticker", id: "backyard", name: "Backyard Sticker" },
    sentences: [
      { text: "Bandit said come here.", orderedWords: ["Bandit", "said", "come", "here", "."], distractors: ["go", "run", "play"] },
      { text: "Run to me!", orderedWords: ["Run", "to", "me", "!"], distractors: ["go", "play", "jump"] },
      { text: "This is so fun.", orderedWords: ["This", "is", "so", "fun", "."], distractors: ["good", "big", "here"] },
    ],
  },
  // Mission 4: Hide and Seek
  {
    title: "Hide and Seek",
    type: "play",
    narrativeIntro: "Chilli is counting! Quick, help the kids hide!",
    narrativeOutro: "You found everyone! Great game!",
    scaffoldingLevel: 2,
    sentences: [
      { text: "Chilli said go hide.", orderedWords: ["Chilli", "said", "go", "hide", "."], distractors: ["run", "play", "come"] },
      { text: "Where is Bingo?", orderedWords: ["Where", "is", "Bingo", "?"], distractors: ["go", "run", "the"] },
      { text: "Look under the bed.", orderedWords: ["Look", "under", "the", "bed", "."], distractors: ["up", "in", "at"] },
      { text: "I can find you.", orderedWords: ["I", "can", "find", "you", "."], distractors: ["see", "go", "run"] },
    ],
  },
  // Mission 5: Grannies
  {
    title: "Grannies",
    type: "play",
    narrativeIntro: "Let's play Grannies! Bluey and Bingo love this game!",
    narrativeOutro: "What lovely grannies you are!",
    scaffoldingLevel: 2,
    unlockReward: { type: "sticker", id: "grannies", name: "Grannies Sticker" },
    sentences: [
      { text: "We are the grannies.", orderedWords: ["We", "are", "the", "grannies", "."], distractors: ["is", "a", "play"] },
      { text: "Come and sit down.", orderedWords: ["Come", "and", "sit", "down", "."], distractors: ["run", "go", "play"] },
      { text: "Have some tea.", orderedWords: ["Have", "some", "tea", "."], distractors: ["go", "run", "play"] },
      { text: "This is a good game.", orderedWords: ["This", "is", "a", "good", "game", "."], distractors: ["fun", "big", "the"] },
    ],
  },
  // Mission 6: Muffin's Birthday
  {
    title: "Muffin's Birthday",
    type: "play",
    narrativeIntro: "It's Muffin's birthday! Help make it the best party ever!",
    narrativeOutro: "Happy birthday, Muffin!",
    scaffoldingLevel: 2,
    unlockReward: { type: "sticker", id: "cake", name: "Birthday Cake Sticker" },
    sentences: [
      { text: "Muffin wants a cake.", orderedWords: ["Muffin", "wants", "a", "cake", "."], distractors: ["play", "go", "run"] },
      { text: "We make a big one.", orderedWords: ["We", "make", "a", "big", "one", "."], distractors: ["little", "the", "go"] },
      { text: "Come to the party.", orderedWords: ["Come", "to", "the", "party", "."], distractors: ["go", "run", "play"] },
      { text: "This is the best day.", orderedWords: ["This", "is", "the", "best", "day", "."], distractors: ["good", "fun", "a"] },
    ],
  },
  // Mission 7: The Pool
  {
    title: "The Pool",
    type: "play",
    narrativeIntro: "It's a hot day! Let's go to the pool and cool down!",
    narrativeOutro: "Splish splash! What a great swim!",
    scaffoldingLevel: 2,
    sentences: [
      { text: "We go to the pool.", orderedWords: ["We", "go", "to", "the", "pool", "."], distractors: ["run", "play", "swim"] },
      { text: "Jump in the water.", orderedWords: ["Jump", "in", "the", "water", "."], distractors: ["run", "go", "play"] },
      { text: "Socks can swim too.", orderedWords: ["Socks", "can", "swim", "too", "."], distractors: ["run", "jump", "play"] },
      { text: "The water is so good.", orderedWords: ["The", "water", "is", "so", "good", "."], distractors: ["fun", "big", "here"] },
    ],
  },
  // Mission 8: Dance Mode
  {
    title: "Dance Mode",
    type: "play",
    narrativeIntro: "Time for Dance Mode! Move those paws!",
    narrativeOutro: "What amazing dancers you are!",
    scaffoldingLevel: 2,
    unlockReward: { type: "minigame", id: "dance-game", name: "Dance Game" },
    sentences: [
      { text: "We love to dance.", orderedWords: ["We", "love", "to", "dance", "."], distractors: ["run", "play", "go"] },
      { text: "Jump up and down.", orderedWords: ["Jump", "up", "and", "down", "."], distractors: ["run", "go", "play"] },
      { text: "Dance with me!", orderedWords: ["Dance", "with", "me", "!"], distractors: ["run", "go", "play"] },
      { text: "This is so much fun.", orderedWords: ["This", "is", "so", "much", "fun", "."], distractors: ["good", "the", "a"] },
    ],
  },
  // Mission 9: The Sleepover
  {
    title: "The Sleepover",
    type: "play",
    narrativeIntro: "Bingo is having a sleepover! Let's make it perfect!",
    narrativeOutro: "Best sleepover ever!",
    scaffoldingLevel: 3,
    sentences: [
      { text: "Bingo said come over.", orderedWords: ["Bingo", "said", "come", "over", "."], distractors: ["go", "run", "here"] },
      { text: "We stay up late.", orderedWords: ["We", "stay", "up", "late", "."], distractors: ["go", "run", "play"] },
      { text: "Look at the stars.", orderedWords: ["Look", "at", "the", "stars", "."], distractors: ["see", "go", "run"] },
      { text: "I love my friends.", orderedWords: ["I", "love", "my", "friends", "."], distractors: ["the", "a", "go"] },
      { text: "Good night, everyone.", orderedWords: ["Good", "night", ",", "everyone", "."], distractors: ["day", "the", "go"] },
    ],
  },
  // Mission 10: Camping
  {
    title: "Camping",
    type: "play",
    narrativeIntro: "The Heeler family is going camping! Build sentences to set up camp!",
    narrativeOutro: "What an amazing camping trip!",
    scaffoldingLevel: 3,
    unlockReward: { type: "sticker", id: "tent", name: "Tent Sticker" },
    sentences: [
      { text: "We go to the woods.", orderedWords: ["We", "go", "to", "the", "woods", "."], distractors: ["run", "play", "here"] },
      { text: "Help me make the tent.", orderedWords: ["Help", "me", "make", "the", "tent", "."], distractors: ["go", "run", "a"] },
      { text: "Look at the big fire.", orderedWords: ["Look", "at", "the", "big", "fire", "."], distractors: ["little", "see", "go"] },
      { text: "We sit and tell stories.", orderedWords: ["We", "sit", "and", "tell", "stories", "."], distractors: ["run", "go", "play"] },
      { text: "This is the best trip.", orderedWords: ["This", "is", "the", "best", "trip", "."], distractors: ["good", "fun", "a"] },
    ],
  },
  // Mission 11: The Beach
  {
    title: "The Beach",
    type: "play",
    narrativeIntro: "Sun, sand, and waves! Let's have a beach day!",
    narrativeOutro: "What a wonderful day at the beach!",
    scaffoldingLevel: 3,
    sentences: [
      { text: "We run on the sand.", orderedWords: ["We", "run", "on", "the", "sand", "."], distractors: ["go", "play", "jump"] },
      { text: "The waves are so big.", orderedWords: ["The", "waves", "are", "so", "big", "."], distractors: ["little", "here", "good"] },
      { text: "Jump over the waves.", orderedWords: ["Jump", "over", "the", "waves", "."], distractors: ["run", "go", "in"] },
      { text: "I can make a sand castle.", orderedWords: ["I", "can", "make", "a", "sand", "castle", "."], distractors: ["go", "run", "the"] },
      { text: "The sun is so warm.", orderedWords: ["The", "sun", "is", "so", "warm", "."], distractors: ["hot", "big", "good"] },
    ],
  },
  // Mission 12: Christmas
  {
    title: "Christmas",
    type: "play",
    narrativeIntro: "It's Christmas at the Heeler house! Time for presents and joy!",
    narrativeOutro: "Merry Christmas to all!",
    scaffoldingLevel: 3,
    unlockReward: { type: "sticker", id: "christmas", name: "Christmas Sticker" },
    sentences: [
      { text: "We love Christmas day.", orderedWords: ["We", "love", "Christmas", "day", "."], distractors: ["the", "a", "go"] },
      { text: "Open the big present.", orderedWords: ["Open", "the", "big", "present", "."], distractors: ["little", "a", "go"] },
      { text: "This is for you.", orderedWords: ["This", "is", "for", "you", "."], distractors: ["the", "me", "go"] },
      { text: "Thank you so much!", orderedWords: ["Thank", "you", "so", "much", "!"], distractors: ["the", "a", "go"] },
      { text: "I love my family.", orderedWords: ["I", "love", "my", "family", "."], distractors: ["the", "a", "friends"] },
    ],
  },
  // Mission 13: The Best Game Ever (Boss)
  {
    title: "The Best Game Ever",
    type: "boss",
    narrativeIntro: "We've played SO many games! Now it's time for the best game ever - using ALL the words we've learned! Are you ready for the ultimate Bluey challenge?",
    narrativeOutro: "YOU DID IT! That was for real life the best game ever! Bluey and Bingo are so happy! You're officially part of the Heeler family!",
    scaffoldingLevel: 4,
    unlockReward: { type: "sticker", id: "bluey-champion", name: "Bluey Champion" },
    sentences: [
      { text: "Bluey and Bingo love to play.", orderedWords: ["Bluey", "and", "Bingo", "love", "to", "play", "."], distractors: ["run", "go", "jump"] },
      { text: "Bandit is the best dad.", orderedWords: ["Bandit", "is", "the", "best", "dad", "."], distractors: ["good", "a", "go"] },
      { text: "Chilli helps with everything.", orderedWords: ["Chilli", "helps", "with", "everything", "."], distractors: ["run", "go", "play"] },
      { text: "We have so much fun together.", orderedWords: ["We", "have", "so", "much", "fun", "together", "."], distractors: ["good", "the", "play"] },
      { text: "This game is the best.", orderedWords: ["This", "game", "is", "the", "best", "."], distractors: ["good", "fun", "a"] },
      { text: "I love my family so much.", orderedWords: ["I", "love", "my", "family", "so", "much", "."], distractors: ["the", "a", "friends"] },
      { text: "For real life!", orderedWords: ["For", "real", "life", "!"], distractors: ["the", "a", "go"] },
    ],
  },
];

// ============================================================================
// ADDITIONAL WORDS NEEDED
// ============================================================================

const additionalWords = [
  // Character names - isCharacterWord: true
  { text: "Bluey", type: "custom", isCharacterWord: true },
  { text: "Bingo", type: "custom", isCharacterWord: true },
  { text: "Bandit", type: "custom", isCharacterWord: true },
  { text: "Chilli", type: "custom", isCharacterWord: true },
  { text: "Muffin", type: "custom", isCharacterWord: true },
  { text: "Socks", type: "custom", isCharacterWord: true },
  // Story-specific words
  { text: "grannies", type: "custom" },
  { text: "pool", type: "custom" },
  { text: "tea", type: "custom" },
  { text: "dance", type: "custom" },
  { text: "sleepover", type: "custom" },
  { text: "party", type: "custom" },
  { text: "cake", type: "custom" },
  { text: "tent", type: "custom" },
  { text: "woods", type: "custom" },
  { text: "stories", type: "custom" },
  { text: "trip", type: "custom" },
  { text: "sand", type: "custom" },
  { text: "castle", type: "custom" },
  { text: "waves", type: "custom" },
  { text: "sun", type: "custom" },
  { text: "warm", type: "custom" },
  { text: "Christmas", type: "custom" },
  { text: "present", type: "custom" },
  { text: "stars", type: "custom" },
  { text: "bed", type: "custom" },
  { text: "game", type: "custom" },
  { text: "family", type: "custom" },
  { text: "friends", type: "custom" },
  { text: "dad", type: "custom" },
  // Action words
  { text: "jump", type: "custom" },
  { text: "hide", type: "custom" },
  { text: "sit", type: "custom" },
  { text: "stay", type: "custom" },
  { text: "tell", type: "custom" },
  { text: "open", type: "custom" },
  { text: "thank", type: "custom" },
  { text: "dance", type: "custom" },
  // Descriptive words
  { text: "late", type: "custom" },
  { text: "night", type: "custom" },
  { text: "best", type: "custom" },
  { text: "real", type: "custom" },
  { text: "life", type: "custom" },
  { text: "much", type: "custom" },
  { text: "over", type: "custom" },
  { text: "everyone", type: "custom" },
  { text: "everything", type: "custom" },
  { text: "wants", type: "custom" },
  { text: "helps", type: "custom" },
  { text: "love", type: "custom" },
];

// ============================================================================
// SEED FUNCTION
// ============================================================================

async function seedBluey() {
  console.log("🐕 Seeding Bluey theme data...\n");

  // 1. Seed additional words
  console.log("1. Seeding Bluey words...");
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

  // 2. Create Bluey theme
  console.log("2. Creating Bluey theme...");
  const [theme] = await db.insert(themes).values({
    name: "bluey",
    displayName: "Bluey: Backyard Adventures",
    palette: blueyPalette,
    assets: blueyAssets,
    characters: blueyCharacters,
    feedbackPhrases: blueyFeedback,
    isActive: true,
    isCustom: false,
  }).returning();
  console.log(`   ✓ Created theme: ${theme.displayName}\n`);

  // 3. Create campaign
  console.log("3. Creating Backyard Adventures campaign...");
  const [campaign] = await db.insert(campaigns).values({
    title: "Backyard Adventures",
    synopsis: "Join Bluey and Bingo for the best games ever! Build sentences to play along with the Heeler family!",
    themeId: theme.id,
    order: 1,
    isActive: true,
  }).returning();
  console.log(`   ✓ Created campaign: ${campaign.title}\n`);

  // 4. Create all missions and sentences
  console.log("4. Creating missions and sentences...");
  let totalSentences = 0;

  for (let i = 0; i < blueyMissions.length; i++) {
    const missionData = blueyMissions[i];

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
  console.log(`\n   Total: ${blueyMissions.length} missions, ${totalSentences} sentences\n`);

  // Summary
  console.log("=====================================");
  console.log("🐕 Bluey theme seeded successfully!");
  console.log("=====================================");
  console.log(`\nSummary:`);
  console.log(`  • ${additionalWords.length} words added`);
  console.log(`  • 1 theme (${theme.displayName})`);
  console.log(`  • 6 characters`);
  console.log(`  • 1 campaign (${campaign.title})`);
  console.log(`  • ${blueyMissions.length} missions`);
  console.log(`  • ${totalSentences} sentences`);
  console.log(`\nTheme ID: ${theme.id}`);
  console.log(`Campaign ID: ${campaign.id}`);
}

seedBluey()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Bluey seed failed:", err.message);
    console.error(err);
    process.exit(1);
  });

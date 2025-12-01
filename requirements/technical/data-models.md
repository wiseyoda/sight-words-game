# Data Models

← [Back to Technical](./README.md)

> **Updated: 2025-11-30**
> Documentation updated to reflect actual implementation and Phase 4 additions (artwork system).

---

## Core Entities

### Word

```typescript
type Word = {
  id: string;                    // UUID (auto-generated)
  text: string;                  // "the", "Chase" (NOT unique - allows duplicates)
  type: 'pre-primer' | 'primer' | 'first-grade' | 'second-grade' |
        'third-grade' | 'custom' | 'generated';
  audioUrl: string | null;       // Vercel Blob URL for TTS audio

  // Flags
  isSightWord: boolean;          // Learning target (colored, NO pictures)
  isCharacterWord: boolean;      // Theme character name (special gold color)

  // Visual representation (for non-sight words)
  emoji: string | null;          // Emoji character(s) for the word
  imageUrl: string | null;       // Uploaded image URL (overrides emoji)

  createdAt: Date;
};

// Note: Word-theme associations are computed from sentence usage,
// not stored directly. The wordThemes junction table exists for
// explicit theme-specific vocabulary (e.g., character names).
```

### Sentence

```typescript
type Sentence = {
  id: string;                    // UUID
  text: string;                  // "The cat runs fast."
  orderedWords: string[];        // ["the", "cat", "runs", "fast"] (word text, not IDs)
  distractors: string[];         // ["dog", "slow"] (word text, not IDs)
  missionId: string | null;      // FK to missions table
  order: number;                 // Position within mission
  createdAt: Date;
};

// Note: Sentences are assigned to missions, not directly to themes.
// Theme association is derived: sentence → mission → campaign → theme
```

### Mission

```typescript
type Mission = {
  id: string;                    // UUID
  title: string;                 // "Chase to the Rescue"
  type: 'play' | 'treasure' | 'boss';
  narrativeIntro: string | null; // "Oh no! The bridge is broken..."
  narrativeOutro: string | null; // "You fixed it! Great job!"
  campaignId: string | null;     // FK to campaigns table
  order: number;                 // Position in campaign
  scaffoldingLevel: number;      // 1-4 (hint level)
  unlockReward: UnlockReward | null;
  artwork: MissionArtwork | null; // NEW: Phase 4 artwork
  isActive: boolean;
  createdAt: Date;
};

type UnlockReward = {
  type: 'sticker' | 'avatar' | 'minigame';
  id: string;
  name?: string;
};

// NEW: Phase 4
type MissionArtwork = {
  introImage?: string;           // Mission-specific intro image URL
  outroImage?: string;           // Mission-specific completion image URL
  character?: string;            // Featured character ID for this mission
};
```

### Campaign

```typescript
type Campaign = {
  id: string;                    // UUID
  title: string;                 // "Adventure Bay Rescue"
  synopsis: string | null;       // Campaign description
  themeId: string | null;        // FK to themes table
  order: number;                 // For selection screen
  artwork: CampaignArtwork | null; // NEW: Phase 4 artwork
  isActive: boolean;
  createdAt: Date;
};

// NEW: Phase 4
type CampaignArtwork = {
  background?: string;           // Campaign-specific background image URL
  introImage?: string;           // Default image for mission intros
};
```

---

## Themes

### Theme

```typescript
type Theme = {
  id: string;                    // UUID
  name: string;                  // "paw-patrol" (slug)
  displayName: string;           // "Paw Patrol: Adventure Bay Rescue"

  palette: ThemePalette | null;
  characters: ThemeCharacter[] | null;
  assets: ThemeAssets | null;
  feedbackPhrases: FeedbackPhrases | null;
  feedbackAudioUrls: FeedbackAudioUrls | null; // TTS audio for phrases

  isActive: boolean;
  isCustom: boolean;
  createdAt: Date;
};

type ThemePalette = {
  primary: string;               // #1E3A8A
  secondary: string;             // #3B82F6
  accent: string;                // #F59E0B
  background: string;            // #EFF6FF
  cardBackground: string;        // #FFFFFF
  text: string;                  // #1F2937
  success: string;               // #10B981
  special?: string;              // Gold color for character cards
};

type ThemeCharacter = {
  id: string;                    // "chase"
  name: string;                  // "Chase"
  imageUrl: string;              // Full-size image
  thumbnailUrl: string;          // For cards/icons
  vocabulary?: string[];         // Associated character-specific words
};

type ThemeAssets = {
  logo?: string;                 // Theme logo URL
  background?: string;           // Default background image
  mapBackground?: string;        // Story map background
  sfxPack?: string;              // Audio sprite URL (future)
  musicTrack?: string;           // Background music URL (future)
};

type FeedbackPhrases = {
  correct: string[];             // ["Paw-some!", "Great job, pup!"]
  encourage: string[];           // ["Almost there!", "Try again!"]
  celebrate: string[];           // ["Mission complete!", "You did it!"]
};

// TTS-generated audio for feedback phrases (stored in Vercel Blob)
type FeedbackAudioUrls = {
  correct?: string[];            // URLs matching feedbackPhrases.correct order
  encourage?: string[];          // URLs matching feedbackPhrases.encourage order
  celebrate?: string[];          // URLs matching feedbackPhrases.celebrate order
};
```

### Artwork Fallback System (Phase 4)

Artwork is resolved using a hierarchical fallback chain:

```
MissionIntro artwork:
  1. mission.artwork.introImage
  2. campaign.artwork.introImage
  3. theme.assets.background
  4. default gradient

Character display:
  1. mission.artwork.character
  2. campaign theme's first character
  3. no character shown

MissionComplete artwork:
  1. mission.artwork.outroImage
  2. campaign.artwork.introImage
  3. theme.assets.background
  4. default gradient
```

**Helper Function**:
```typescript
function getArtworkUrl(
  mission: Mission | null,
  campaign: Campaign | null,
  theme: Theme | null,
  type: 'intro' | 'outro' | 'background'
): string | null {
  if (type === 'intro') {
    return mission?.artwork?.introImage
      ?? campaign?.artwork?.introImage
      ?? theme?.assets?.background
      ?? null;
  }
  if (type === 'outro') {
    return mission?.artwork?.outroImage
      ?? campaign?.artwork?.introImage
      ?? theme?.assets?.background
      ?? null;
  }
  return campaign?.artwork?.background
    ?? theme?.assets?.background
    ?? null;
}
```

---

## Player & Progress

### Player

```typescript
type Player = {
  id: string;                    // UUID
  name: string;                  // "Emma"
  avatarId: string | null;

  // Current position
  currentThemeId: string | null;     // FK to themes
  currentCampaignId: string | null;  // FK to campaigns
  currentMissionId: string | null;   // FK to missions

  // Stats
  totalStars: number;
  totalPlayTimeSeconds: number;

  createdAt: Date;
  updatedAt: Date;
};
```

### MissionProgress

```typescript
type MissionProgress = {
  id: string;                    // UUID
  playerId: string;              // FK to players
  missionId: string;             // FK to missions
  stars: number;                 // 0-3 stars earned
  completedAt: Date;
};

// Note: Unique constraint on (playerId, missionId)
// One progress record per player per mission
```

### WordMastery

```typescript
type WordMastery = {
  id: string;                    // UUID
  playerId: string;              // FK to players
  wordId: string;                // FK to words

  // Counts
  timesSeen: number;
  timesCorrectFirstTry: number;
  timesNeededRetry: number;
  timesNeededHint: number;

  // Streaks
  streakCurrent: number;
  streakBest: number;

  // Calculated
  masteryLevel: 'new' | 'learning' | 'familiar' | 'mastered';

  // Timestamps
  lastSeenAt: Date | null;
};
```

### PlayerUnlocks

```typescript
type PlayerUnlock = {
  id: string;                    // UUID
  playerId: string;              // FK to players
  unlockType: 'avatar' | 'sticker';
  unlockId: string;              // ID of the unlocked item
  unlockedAt: Date;
};
```

---

## Unlockables

### Avatar

```typescript
type Avatar = {
  id: string;
  name: string;                  // "Rocket"
  imageUrl: string;
  unlockCondition: AvatarUnlockCondition;
};

type AvatarUnlockCondition = {
  type: 'default' | 'missions' | 'stars' | 'campaign' | 'words';
  value?: number;                // e.g., 5 missions
  campaignId?: string;
};
```

### Sticker

```typescript
type Sticker = {
  id: string;
  name: string;                  // "Chase Badge"
  imageUrl: string;
  themeId?: string;
  category: 'theme' | 'achievement' | 'special';
  unlockCondition: StickerUnlockCondition;
};

type StickerUnlockCondition = {
  type: 'mission' | 'stars' | 'words' | 'streak' | 'campaign';
  value?: number;
  missionId?: string;
};
```

---

## Mini-Games

### MiniGame

```typescript
type MiniGame = {
  id: string;
  type: 'bingo' | 'memory' | 'whack';
  name: string;
  description: string;
  unlockCondition: {
    missionsCompleted: number;
  };
  config: BingoConfig | MemoryConfig | WhackConfig;
};

type BingoConfig = {
  gridSize: 3;
  wordsPerGame: 9;
  targetDifficulty: 'pre-primer' | 'primer' | 'mixed';
};

type MemoryConfig = {
  pairs: number;                 // 6 = 12 cards
  matchType: 'word-word' | 'word-image' | 'mixed';
};

type WhackConfig = {
  durationSeconds: number;
  targetCount: number;
  spawnRateMs: number;
};
```

---

## App Settings

```typescript
type AppSettings = {
  id: string;                    // UUID
  key: string;                   // "global" (currently only one record)
  value: AppSettingsData;
  updatedAt: Date;
};

type AppSettingsData = {
  ttsVoice: TTSVoice;            // Voice for TTS generation
  speechSpeed: number;           // 0.25 to 4.0 (default 1.0)
  sentenceGeneratorModel: string; // AI model for sentence generation
  validationModel: string;       // AI model for validation
  campaignGeneratorModel: string; // AI model for campaign generation
};

type TTSVoice =
  | 'alloy'    // Neutral, balanced
  | 'ash'      // Clear, professional
  | 'ballad'   // Melodic, expressive
  | 'coral'    // Warm, friendly (recommended for children)
  | 'echo'     // Clear, measured
  | 'fable'    // Expressive, storytelling
  | 'nova'     // Friendly, upbeat
  | 'onyx'     // Deep, authoritative
  | 'sage'     // Calm, reassuring
  | 'shimmer'; // Bright, energetic
```

---

## Schema Migration (Phase 4)

The following migrations are required for Phase 4:

```sql
-- Add artwork JSONB to campaigns
ALTER TABLE campaigns ADD COLUMN artwork JSONB;

-- Add artwork JSONB to missions
ALTER TABLE missions ADD COLUMN artwork JSONB;
```

**Drizzle Schema Additions**:
```typescript
// In campaigns table
artwork: jsonb("artwork").$type<CampaignArtwork>(),

// In missions table
artwork: jsonb("artwork").$type<MissionArtwork>(),
```

---

## Database Relationships

```
themes
  └── campaigns (one-to-many)
        └── missions (one-to-many)
              └── sentences (one-to-many)

players
  ├── missionProgress (one-to-many)
  ├── wordMastery (one-to-many)
  └── playerUnlocks (one-to-many)

words
  └── wordThemes (junction table for theme associations)
```

---

← [Technical](./README.md) | [API Routes →](./api-routes.md)

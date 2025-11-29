# Data Models

← [Back to Technical](./README.md)

---

## Core Entities

### Word

```typescript
type Word = {
  id: string;                    // UUID
  text: string;                  // "the", "cat"
  audioUrl: string | null;       // Vercel Blob URL
  difficulty: 'pre-primer' | 'primer' | 'grade-1' | 'custom';
  partOfSpeech: 'noun' | 'verb' | 'adjective' | 'adverb' |
                'pronoun' | 'preposition' | 'conjunction' |
                'article' | 'interjection' | 'number';
  tags: string[];                // ['color', 'action']
  imageUrl?: string;             // For pictured words
  themeId?: string;              // If theme-specific
  isCustom: boolean;
  createdAt: Date;
  updatedAt: Date;
};
```

### Sentence

```typescript
type Sentence = {
  id: string;
  text: string;                  // "The cat runs fast."
  orderedWordIds: string[];      // ["the", "cat", "runs", "fast", "."]
  themeId?: string;
  campaignId?: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  distractorWordIds: string[];   // Words to show but not use
  audioUrl?: string;             // Full sentence audio for hints
  createdAt: Date;
  updatedAt: Date;
};
```

### Mission

```typescript
type Mission = {
  id: string;
  campaignId: string;
  order: number;                 // Position in campaign
  type: 'play' | 'treasure' | 'minigame' | 'boss';
  title: string;                 // "Fix the Bridge"
  sentenceIds: string[];
  narrativeIntro: string;        // "Oh no! The bridge is broken..."
  narrativeOutro: string;        // "You fixed it! Great job!"
  scaffoldingLevel: 1 | 2 | 3 | 4;
  unlockRewardId?: string;       // Avatar or sticker ID
  minigameId?: string;           // If type is minigame
  createdAt: Date;
};
```

### Campaign

```typescript
type Campaign = {
  id: string;
  themeId: string;
  name: string;                  // "Adventure Bay Rescue"
  description: string;
  missionIds: string[];
  order: number;                 // For selection screen
  targetWordLevel: 'pre-primer' | 'primer' | 'grade-1';
  isCustom: boolean;
  createdAt: Date;
};
```

---

## Themes

### Theme

```typescript
type Theme = {
  id: string;
  name: string;                  // "Paw Patrol"
  displayName: string;           // "Paw Patrol: Adventure Bay Rescue"

  palette: ThemePalette;
  characters: ThemeCharacter[];
  assets: ThemeAssets;
  feedbackPhrases: ThemePhrases;

  isActive: boolean;
  isCustom: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type ThemePalette = {
  primary: string;               // #0066CC
  secondary: string;
  accent: string;
  background: string;
  cardBackground: string;
  text: string;
  success: string;
  special: string;               // Character cards
};

type ThemeCharacter = {
  id: string;
  name: string;                  // "Chase"
  imageUrl: string;
  thumbnailUrl: string;
  vocabulary: string[];          // Associated words
};

type ThemeAssets = {
  logo?: string;
  background: string;
  mapBackground: string;
  sfxPack: string;               // Audio sprite URL
  musicTrack?: string;
};

type ThemePhrases = {
  correct: string[];             // ["Paw-some!", "Great job!"]
  encourage: string[];           // ["Almost!", "Try again!"]
  celebrate: string[];           // ["Mission complete!"]
};
```

---

## Player & Progress

### PlayerProfile

```typescript
type PlayerProfile = {
  id: string;
  displayName: string;           // "Emma"
  avatarId: string;
  createdAt: Date;
  lastPlayedAt: Date;
  settings: PlayerSettings;
};

type PlayerSettings = {
  hintsEnabled: boolean;
  hintLevel: 1 | 2 | 3 | 4;      // Starting scaffolding
  sfxEnabled: boolean;
  musicEnabled: boolean;
  voiceEnabled: boolean;
  volumeVoice: number;           // 0-100
  volumeEffects: number;
  volumeMusic: number;
  sessionReminderMinutes: number; // 0 = off
  reducedMotion: boolean;
};
```

### PlayerProgress

```typescript
type PlayerProgress = {
  id: string;
  playerId: string;

  // Campaign/Mission progress
  completedMissionIds: string[];
  currentCampaignId?: string;
  currentMissionId?: string;
  missionStars: Record<string, 1 | 2 | 3>;

  // Unlockables
  unlockedAvatarIds: string[];
  unlockedStickerIds: string[];
  unlockedMinigameIds: string[];

  // Stats
  totalStars: number;
  totalPlayTimeSeconds: number;
  totalMissionsCompleted: number;
  longestStreak: number;

  // Sync
  lastSyncedAt: Date;
  version: number;               // For conflict resolution
};
```

### WordMastery

```typescript
type WordMastery = {
  id: string;
  playerId: string;
  wordId: string;

  // Counts
  timesSeen: number;
  timesCorrectFirstTry: number;
  timesNeededRetry: number;
  timesNeededHint: number;

  // Streaks
  streakCurrent: number;
  streakBest: number;

  // Timestamps
  firstSeenAt: Date;
  lastSeenAt: Date;
  lastCorrectAt?: Date;

  // Calculated
  masteryLevel: 'new' | 'learning' | 'familiar' | 'mastered';
  accuracy: number;              // 0-100
};
```

### Attempt

```typescript
type Attempt = {
  id: string;
  playerId: string;
  missionId: string;
  sentenceId: string;

  correct: boolean;
  attemptNumber: number;         // 1st, 2nd, 3rd try
  usedHint: boolean;
  hintLevel?: 1 | 2 | 3;
  timeToCompleteMs: number;
  submittedOrder: string[];      // Word IDs in submitted order
  timestamp: Date;
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

## Drizzle Schema Example

```typescript
// /lib/db/schema.ts

import { pgTable, text, timestamp, integer, boolean, json } from 'drizzle-orm/pg-core';

export const words = pgTable('words', {
  id: text('id').primaryKey(),
  text: text('text').notNull(),
  audioUrl: text('audio_url'),
  difficulty: text('difficulty').notNull(),
  partOfSpeech: text('part_of_speech').notNull(),
  tags: json('tags').$type<string[]>().default([]),
  imageUrl: text('image_url'),
  themeId: text('theme_id'),
  isCustom: boolean('is_custom').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const players = pgTable('players', {
  id: text('id').primaryKey(),
  displayName: text('display_name').notNull(),
  avatarId: text('avatar_id').notNull(),
  settings: json('settings').$type<PlayerSettings>(),
  createdAt: timestamp('created_at').defaultNow(),
  lastPlayedAt: timestamp('last_played_at'),
});

export const wordMastery = pgTable('word_mastery', {
  id: text('id').primaryKey(),
  playerId: text('player_id').notNull().references(() => players.id),
  wordId: text('word_id').notNull().references(() => words.id),
  timesSeen: integer('times_seen').default(0),
  timesCorrectFirstTry: integer('times_correct_first_try').default(0),
  timesNeededRetry: integer('times_needed_retry').default(0),
  timesNeededHint: integer('times_needed_hint').default(0),
  streakCurrent: integer('streak_current').default(0),
  streakBest: integer('streak_best').default(0),
  masteryLevel: text('mastery_level').default('new'),
  accuracy: integer('accuracy').default(0),
  firstSeenAt: timestamp('first_seen_at'),
  lastSeenAt: timestamp('last_seen_at'),
  lastCorrectAt: timestamp('last_correct_at'),
});
```

---

← [Technical](./README.md) | [API Routes →](./api-routes.md)

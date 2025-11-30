import { pgTable, text, timestamp, integer, boolean, uuid, varchar, jsonb, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================================================
// WORDS & CURRICULUM
// ============================================================================

export const words = pgTable("words", {
  id: uuid("id").primaryKey().defaultRandom(),
  text: varchar("text", { length: 50 }).notNull().unique(),
  level: varchar("level", { length: 20 }).notNull(), // pre-primer, primer, first-grade
  audioUrl: text("audio_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================================
// SENTENCES & MISSIONS
// ============================================================================

export const sentences = pgTable("sentences", {
  id: uuid("id").primaryKey().defaultRandom(),
  text: text("text").notNull(),
  orderedWords: jsonb("ordered_words").$type<string[]>().notNull(),
  distractors: jsonb("distractors").$type<string[]>().default([]),
  missionId: uuid("mission_id").references(() => missions.id),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type UnlockReward = {
  type: "sticker" | "avatar" | "minigame";
  id: string;
  name?: string;
};

export const missions = pgTable("missions", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 100 }).notNull(),
  type: varchar("type", { length: 20 }).notNull().default("play"), // play, treasure, boss
  narrativeIntro: text("narrative_intro"),
  narrativeOutro: text("narrative_outro"),
  campaignId: uuid("campaign_id").references(() => campaigns.id),
  order: integer("order").default(0),
  scaffoldingLevel: integer("scaffolding_level").default(1),
  unlockReward: jsonb("unlock_reward").$type<UnlockReward>(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const campaigns = pgTable("campaigns", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 100 }).notNull(),
  synopsis: text("synopsis"),
  themeId: uuid("theme_id").references(() => themes.id),
  order: integer("order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================================
// THEMES
// ============================================================================

export type ThemePalette = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  cardBackground: string;
  text: string;
  success: string;
  special?: string; // Gold/accent color for character cards
};

export type ThemeAssets = {
  logo?: string;
  background?: string;
  mapBackground?: string;
  sfxPack?: string;
  musicTrack?: string;
};

export type ThemeCharacter = {
  id: string;
  name: string;
  imageUrl: string;
  thumbnailUrl: string;
  vocabulary?: string[];
};

export type FeedbackPhrases = {
  correct: string[];
  encourage: string[];
  celebrate: string[];
};

export type FeedbackAudioUrls = {
  correct?: string[];
  encourage?: string[];
  celebrate?: string[];
};

export const themes = pgTable("themes", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 50 }).notNull(),
  displayName: varchar("display_name", { length: 100 }).notNull(),
  palette: jsonb("palette").$type<ThemePalette>(),
  assets: jsonb("assets").$type<ThemeAssets>(),
  characters: jsonb("characters").$type<ThemeCharacter[]>(),
  feedbackPhrases: jsonb("feedback_phrases").$type<FeedbackPhrases>(),
  feedbackAudioUrls: jsonb("feedback_audio_urls").$type<FeedbackAudioUrls>(),
  isActive: boolean("is_active").default(true),
  isCustom: boolean("is_custom").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================================
// PLAYERS & PROGRESS
// ============================================================================

export const players = pgTable("players", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 50 }).notNull(),
  avatarId: varchar("avatar_id", { length: 50 }),
  currentThemeId: uuid("current_theme_id").references(() => themes.id),
  currentCampaignId: uuid("current_campaign_id").references(() => campaigns.id),
  currentMissionId: uuid("current_mission_id").references(() => missions.id),
  totalStars: integer("total_stars").default(0),
  totalPlayTimeSeconds: integer("total_play_time_seconds").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const missionProgress = pgTable("mission_progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  playerId: uuid("player_id").references(() => players.id).notNull(),
  missionId: uuid("mission_id").references(() => missions.id).notNull(),
  stars: integer("stars").default(0),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
}, (table) => ({
  // Ensure one progress record per player per mission
  playerMissionUnique: uniqueIndex("mission_progress_player_mission_idx").on(table.playerId, table.missionId),
}));

export const wordMastery = pgTable("word_mastery", {
  id: uuid("id").primaryKey().defaultRandom(),
  playerId: uuid("player_id").references(() => players.id).notNull(),
  wordId: uuid("word_id").references(() => words.id).notNull(),
  timesSeen: integer("times_seen").default(0),
  timesCorrectFirstTry: integer("times_correct_first_try").default(0),
  timesNeededRetry: integer("times_needed_retry").default(0),
  timesNeededHint: integer("times_needed_hint").default(0),
  streakCurrent: integer("streak_current").default(0),
  streakBest: integer("streak_best").default(0),
  masteryLevel: varchar("mastery_level", { length: 20 }).default("new"), // new, learning, familiar, mastered
  lastSeenAt: timestamp("last_seen_at"),
});

// ============================================================================
// UNLOCKABLES
// ============================================================================

export const playerUnlocks = pgTable("player_unlocks", {
  id: uuid("id").primaryKey().defaultRandom(),
  playerId: uuid("player_id").references(() => players.id).notNull(),
  unlockType: varchar("unlock_type", { length: 20 }).notNull(), // avatar, sticker
  unlockId: varchar("unlock_id", { length: 50 }).notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
});

// ============================================================================
// RELATIONS (for db.query)
// ============================================================================

export const themesRelations = relations(themes, ({ many }) => ({
  campaigns: many(campaigns),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  theme: one(themes, {
    fields: [campaigns.themeId],
    references: [themes.id],
  }),
  missions: many(missions),
}));

export const missionsRelations = relations(missions, ({ one, many }) => ({
  campaign: one(campaigns, {
    fields: [missions.campaignId],
    references: [campaigns.id],
  }),
  sentences: many(sentences),
}));

export const sentencesRelations = relations(sentences, ({ one }) => ({
  mission: one(missions, {
    fields: [sentences.missionId],
    references: [missions.id],
  }),
}));

export const playersRelations = relations(players, ({ one, many }) => ({
  currentTheme: one(themes, {
    fields: [players.currentThemeId],
    references: [themes.id],
  }),
  currentCampaign: one(campaigns, {
    fields: [players.currentCampaignId],
    references: [campaigns.id],
  }),
  currentMission: one(missions, {
    fields: [players.currentMissionId],
    references: [missions.id],
  }),
  missionProgress: many(missionProgress),
  wordMastery: many(wordMastery),
  unlocks: many(playerUnlocks),
}));

export const missionProgressRelations = relations(missionProgress, ({ one }) => ({
  player: one(players, {
    fields: [missionProgress.playerId],
    references: [players.id],
  }),
  mission: one(missions, {
    fields: [missionProgress.missionId],
    references: [missions.id],
  }),
}));

export const wordMasteryRelations = relations(wordMastery, ({ one }) => ({
  player: one(players, {
    fields: [wordMastery.playerId],
    references: [players.id],
  }),
  word: one(words, {
    fields: [wordMastery.wordId],
    references: [words.id],
  }),
}));

export const playerUnlocksRelations = relations(playerUnlocks, ({ one }) => ({
  player: one(players, {
    fields: [playerUnlocks.playerId],
    references: [players.id],
  }),
}));

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type Word = typeof words.$inferSelect;
export type NewWord = typeof words.$inferInsert;
export type Sentence = typeof sentences.$inferSelect;
export type Mission = typeof missions.$inferSelect;
export type Campaign = typeof campaigns.$inferSelect;
export type Theme = typeof themes.$inferSelect;
export type Player = typeof players.$inferSelect;
export type MissionProgress = typeof missionProgress.$inferSelect;
export type WordMastery = typeof wordMastery.$inferSelect;

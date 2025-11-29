import { pgTable, text, timestamp, integer, boolean, uuid, varchar, jsonb } from "drizzle-orm/pg-core";

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

export const missions = pgTable("missions", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 100 }).notNull(),
  type: varchar("type", { length: 20 }).notNull().default("play"), // play, treasure, boss
  narrativeIntro: text("narrative_intro"),
  narrativeOutro: text("narrative_outro"),
  campaignId: uuid("campaign_id").references(() => campaigns.id),
  order: integer("order").default(0),
  scaffoldingLevel: integer("scaffolding_level").default(1),
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

export const themes = pgTable("themes", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 50 }).notNull(),
  displayName: varchar("display_name", { length: 100 }).notNull(),
  palette: jsonb("palette").$type<{
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    cardBackground: string;
    text: string;
    success: string;
  }>(),
  feedbackPhrases: jsonb("feedback_phrases").$type<{
    correct: string[];
    encourage: string[];
    celebrate: string[];
  }>(),
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
});

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

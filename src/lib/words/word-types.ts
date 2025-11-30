import type { Word, ThemePalette } from "@/lib/db/schema";

// Word type classification for color coding in game UI
export type WordType = "sight" | "character" | "other";

/**
 * Dolch sight word types - these are the learning targets
 * Reference: requirements/curriculum/word-lists.md
 *
 * - pre-primer: 40 basic words (Campaign 1)
 * - primer: 52 words (Campaign 2)
 * - first-grade: 41 words (Campaign 3)
 * - second-grade: 46 words (future expansion)
 * - third-grade: 41 words (future expansion)
 */
export const DOLCH_TYPES = ["pre-primer", "primer", "first-grade", "second-grade", "third-grade"] as const;

/**
 * Non-sight word types - these are supporting/filler words
 * Whether a word has an emoji/image is determined by the emoji/imageUrl fields, not the type.
 *
 * - custom: Non-sight words (nouns, theme words, character names, etc.)
 * - generated: AI-generated words for dynamic content
 */
export const NON_SIGHT_TYPES = ["custom", "generated"] as const;

// All valid word types
export const ALL_WORD_TYPES = [...DOLCH_TYPES, ...NON_SIGHT_TYPES] as const;

/**
 * Determine the word type for color coding
 * Uses the isSightWord and isCharacterWord flags directly
 */
export function getWordType(word: Pick<Word, "isSightWord" | "isCharacterWord">): WordType {
  if (word.isCharacterWord) {
    return "character";
  }
  if (word.isSightWord) {
    return "sight";
  }
  return "other";
}

/**
 * Check if a word can have a picture (emoji or image)
 * Sight words should NOT have pictures to focus on word recognition
 */
export function canHavePicture(word: Pick<Word, "isSightWord" | "isCharacterWord">): boolean {
  return !word.isSightWord;
}

/**
 * Get the visual representation for a word (image takes priority over emoji)
 */
export function getWordVisual(word: Pick<Word, "emoji" | "imageUrl">): { type: "image" | "emoji" | null; value: string | null } {
  if (word.imageUrl) {
    return { type: "image", value: word.imageUrl };
  }
  if (word.emoji) {
    return { type: "emoji", value: word.emoji };
  }
  return { type: null, value: null };
}

// Default colors for word types (when no theme is active)
export const DEFAULT_WORD_COLORS = {
  sight: {
    background: "#fef3c7", // Warm amber/yellow
    border: "#f59e0b",
    text: "#92400e",
  },
  character: {
    background: "#ddd6fe", // Purple/special
    border: "#8b5cf6",
    text: "#5b21b6",
  },
  other: {
    background: "#ffffff", // White/neutral
    border: "#e5e7eb",
    text: "#374151",
  },
} as const;

/**
 * Get card colors for a word based on type and optional theme
 */
export function getWordCardColors(
  wordType: WordType,
  theme?: { palette?: ThemePalette | null } | null
): { background: string; border: string; text: string } {
  // Character words use theme colors if available
  if (wordType === "character" && theme?.palette) {
    return {
      background: theme.palette.special || theme.palette.accent + "33", // 20% opacity
      border: theme.palette.special || theme.palette.accent,
      text: theme.palette.text,
    };
  }

  // Sight words use theme primary if available
  if (wordType === "sight" && theme?.palette) {
    return {
      background: theme.palette.primary + "22", // Light tint
      border: theme.palette.primary,
      text: theme.palette.text,
    };
  }

  // Default colors
  return DEFAULT_WORD_COLORS[wordType];
}

/**
 * Common emoji mappings for words that can be auto-assigned
 * These are concrete nouns and some common verbs
 */
export const COMMON_WORD_EMOJIS: Record<string, string> = {
  // Animals
  dog: "🐕",
  cat: "🐈",
  bird: "🐦",
  fish: "🐟",
  horse: "🐴",
  cow: "🐄",
  pig: "🐷",
  duck: "🦆",
  chicken: "🐔",
  rabbit: "🐰",
  bear: "🐻",
  lion: "🦁",
  tiger: "🐯",
  elephant: "🐘",
  monkey: "🐵",
  frog: "🐸",
  bee: "🐝",
  butterfly: "🦋",

  // Food
  apple: "🍎",
  banana: "🍌",
  orange: "🍊",
  cake: "🎂",
  cookie: "🍪",
  bread: "🍞",
  milk: "🥛",
  egg: "🥚",
  cheese: "🧀",
  pizza: "🍕",
  ice: "🧊",

  // Nature
  tree: "🌳",
  flower: "🌸",
  sun: "☀️",
  moon: "🌙",
  star: "⭐",
  rain: "🌧️",
  snow: "❄️",
  water: "💧",
  fire: "🔥",
  grass: "🌿",
  leaf: "🍃",

  // Objects
  ball: "⚽",
  book: "📖",
  car: "🚗",
  bus: "🚌",
  train: "🚂",
  boat: "⛵",
  plane: "✈️",
  house: "🏠",
  door: "🚪",
  bed: "🛏️",
  chair: "🪑",
  table: "🪑",
  phone: "📱",
  clock: "🕐",
  key: "🔑",
  hat: "🎩",
  shoe: "👟",
  shirt: "👕",

  // People & Body
  baby: "👶",
  boy: "👦",
  girl: "👧",
  man: "👨",
  woman: "👩",
  hand: "✋",
  eye: "👁️",
  heart: "❤️",

  // Activities & Actions
  run: "🏃",
  walk: "🚶",
  swim: "🏊",
  sleep: "😴",
  eat: "🍽️",
  play: "🎮",
  sing: "🎤",
  dance: "💃",

  // Emotions (concrete facial expressions)
  happy: "😊",
  sad: "😢",

  // Note: Abstract adjectives like "big", "small", "hot", "cold", "fast", "slow"
  // are intentionally NOT mapped to emojis as they can be confusing for children
  // (e.g., "big" → elephant implies "big" means "elephant")
};

/**
 * Try to get an auto-generated emoji for a word
 */
export function getAutoEmoji(wordText: string): string | null {
  const normalized = wordText.toLowerCase().trim();
  return COMMON_WORD_EMOJIS[normalized] || null;
}

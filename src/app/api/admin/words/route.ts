import { NextRequest, NextResponse } from "next/server";
import { db, words, sentences } from "@/lib/db";
import { eq, asc, isNotNull } from "drizzle-orm";
import { ALL_WORD_TYPES } from "@/lib/words/word-types";
import type { Theme } from "@/lib/db/schema";

export const runtime = "nodejs";

const WORD_MAX_LENGTH = 50;
const ALLOWED_TYPES = new Set(ALL_WORD_TYPES);

// Helper to compute which adventures (themes) a word appears in based on sentence usage
async function computeWordAdventures(): Promise<Map<string, Theme[]>> {
  // Fetch all sentences with their mission -> campaign -> theme chain
  const allSentences = await db.query.sentences.findMany({
    where: isNotNull(sentences.missionId),
    with: {
      mission: {
        with: {
          campaign: {
            with: {
              theme: true,
            },
          },
        },
      },
    },
  });

  // Build a map of word text (lowercase) -> Set of theme IDs
  const wordToThemeIds = new Map<string, Set<string>>();
  const themeMap = new Map<string, Theme>();

  for (const sentence of allSentences) {
    const theme = sentence.mission?.campaign?.theme;
    if (!theme) continue;

    themeMap.set(theme.id, theme);

    // Check orderedWords
    const orderedWords = sentence.orderedWords || [];
    for (const wordText of orderedWords) {
      const key = wordText.toLowerCase();
      if (!wordToThemeIds.has(key)) {
        wordToThemeIds.set(key, new Set());
      }
      wordToThemeIds.get(key)!.add(theme.id);
    }

    // Check distractors
    const distractors = sentence.distractors || [];
    for (const wordText of distractors) {
      const key = wordText.toLowerCase();
      if (!wordToThemeIds.has(key)) {
        wordToThemeIds.set(key, new Set());
      }
      wordToThemeIds.get(key)!.add(theme.id);
    }
  }

  // Convert to Theme[] arrays
  const wordToThemes = new Map<string, Theme[]>();
  wordToThemeIds.forEach((themeIds, wordText) => {
    const themes = Array.from(themeIds)
      .map((id) => themeMap.get(id))
      .filter((t): t is Theme => t !== undefined);
    wordToThemes.set(wordText, themes);
  });

  return wordToThemes;
}

// GET /api/admin/words - List all words with computed adventures
export async function GET() {
  try {
    const allWords = await db.query.words.findMany({
      orderBy: [asc(words.text)],
    });

    // Compute which adventures each word appears in
    const wordAdventures = await computeWordAdventures();

    // Transform to include adventures array (computed from sentence usage)
    const wordsWithAdventures = allWords.map((word) => ({
      ...word,
      // Adventures are computed based on sentence usage, not stored associations
      adventures: wordAdventures.get(word.text.toLowerCase()) || [],
    }));

    return NextResponse.json({ words: wordsWithAdventures });
  } catch (error) {
    console.error("Error fetching words:", error);
    return NextResponse.json(
      { error: "Failed to fetch words" },
      { status: 500 }
    );
  }
}

// POST /api/admin/words - Create a new word
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      text,
      type = "custom",
      isSightWord = false,
      isCharacterWord = false,
      emoji,
      imageUrl,
    } = body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Word text is required" },
        { status: 400 }
      );
    }

    // Validate word length
    if (text.trim().length > WORD_MAX_LENGTH) {
      return NextResponse.json(
        { error: "Word is too long (max 50 characters)" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.has(type)) {
      return NextResponse.json(
        { error: "Invalid type" },
        { status: 400 }
      );
    }

    // Sight words should be lowercase; non-sight words preserve capitalization
    const effectiveIsSightWord = Boolean(isSightWord);
    const wordText = effectiveIsSightWord ? text.trim().toLowerCase() : text.trim();

    // Sight words should not have pictures or be character words
    const finalEmoji = effectiveIsSightWord ? null : (emoji || null);
    const finalImageUrl = effectiveIsSightWord ? null : (imageUrl || null);
    const finalIsCharacterWord = effectiveIsSightWord ? false : Boolean(isCharacterWord);

    // Create the word
    const [newWord] = await db
      .insert(words)
      .values({
        text: wordText,
        type: type,
        isSightWord: effectiveIsSightWord,
        isCharacterWord: finalIsCharacterWord,
        emoji: finalEmoji,
        imageUrl: finalImageUrl,
      })
      .returning();

    // Adventures are computed from sentence usage, not stored associations
    // Return the new word with empty adventures (will be populated when used in sentences)
    return NextResponse.json({
      word: {
        ...newWord,
        adventures: [],
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating word:", error);
    return NextResponse.json(
      { error: "Failed to create word" },
      { status: 500 }
    );
  }
}

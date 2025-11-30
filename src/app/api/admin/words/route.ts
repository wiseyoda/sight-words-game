import { NextRequest, NextResponse } from "next/server";
import { db, words, wordThemes, themes } from "@/lib/db";
import { eq, asc, inArray } from "drizzle-orm";
import { ALL_WORD_TYPES, DOLCH_TYPES } from "@/lib/words/word-types";

export const runtime = "nodejs";

const WORD_MAX_LENGTH = 50;
const ALLOWED_TYPES = new Set(ALL_WORD_TYPES);

// GET /api/admin/words - List all words with their themes
export async function GET() {
  try {
    const allWords = await db.query.words.findMany({
      orderBy: [asc(words.text)],
      with: {
        wordThemes: {
          with: {
            theme: true,
          },
        },
      },
    });

    // Transform to include themes array
    const wordsWithThemes = allWords.map((word) => ({
      ...word,
      themes: word.wordThemes.map((wt) => wt.theme),
    }));

    return NextResponse.json({ words: wordsWithThemes });
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
      themeIds = [],
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

    // Validate themeIds if provided
    if (themeIds.length > 0) {
      if (!Array.isArray(themeIds) || !themeIds.every((id: unknown) => typeof id === "string")) {
        return NextResponse.json(
          { error: "themeIds must be an array of strings" },
          { status: 400 }
        );
      }
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

    // Add theme associations if provided
    if (themeIds.length > 0) {
      await db.insert(wordThemes).values(
        themeIds.map((themeId: string) => ({
          wordId: newWord.id,
          themeId,
        }))
      );
    }

    // Fetch the word with themes for response
    const wordWithThemes = await db.query.words.findFirst({
      where: eq(words.id, newWord.id),
      with: {
        wordThemes: {
          with: {
            theme: true,
          },
        },
      },
    });

    return NextResponse.json({
      word: {
        ...wordWithThemes,
        themes: wordWithThemes?.wordThemes.map((wt) => wt.theme) || [],
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

import { NextRequest, NextResponse } from "next/server";
import { db, words } from "@/lib/db";
import { eq } from "drizzle-orm";
import { ALL_WORD_TYPES } from "@/lib/words/word-types";

export const runtime = "nodejs";

const WORD_MAX_LENGTH = 50;
const ALLOWED_TYPES = new Set(ALL_WORD_TYPES);

function isValidId(id: string | undefined) {
  return typeof id === "string" && id.length > 0 && id.length <= 100;
}

// DELETE /api/admin/words/[id] - Delete a word
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!isValidId(id)) {
      return NextResponse.json(
        { error: "Invalid word id" },
        { status: 400 }
      );
    }

    // wordThemes will be deleted automatically due to onDelete: "cascade"
    const deleted = await db
      .delete(words)
      .where(eq(words.id, id))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: "Word not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ deleted: deleted[0] });
  } catch (error) {
    console.error("Error deleting word:", error);
    return NextResponse.json(
      { error: "Failed to delete word" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/words/[id] - Update a word
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!isValidId(id)) {
      return NextResponse.json(
        { error: "Invalid word id" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { text, type, audioUrl, emoji, imageUrl, isCharacterWord, isSightWord } = body;

    const updates: Partial<{
      text: string;
      type: string;
      audioUrl: string | null;
      emoji: string | null;
      imageUrl: string | null;
      isCharacterWord: boolean;
      isSightWord: boolean;
    }> = {};

    // Handle type update
    if (type !== undefined) {
      if (!ALLOWED_TYPES.has(type)) {
        return NextResponse.json(
          { error: "Invalid type" },
          { status: 400 }
        );
      }
      updates.type = type;
    }

    // Handle isSightWord flag
    if (isSightWord !== undefined) {
      updates.isSightWord = Boolean(isSightWord);
    }

    // Handle text update
    if (text !== undefined) {
      const trimmed = typeof text === "string" ? text.trim() : "";
      if (!trimmed || trimmed.length > WORD_MAX_LENGTH) {
        return NextResponse.json(
          { error: "Word must be a non-empty string up to 50 characters" },
          { status: 400 }
        );
      }
      // Sight words should be lowercase; non-sight words preserve capitalization
      const effectiveIsSightWord = updates.isSightWord ?? isSightWord ?? false;
      updates.text = effectiveIsSightWord ? trimmed.toLowerCase() : trimmed;
    }

    if (audioUrl !== undefined) {
      if (audioUrl !== null && typeof audioUrl !== "string") {
        return NextResponse.json(
          { error: "audioUrl must be a string or null" },
          { status: 400 }
        );
      }
      updates.audioUrl = audioUrl;
    }

    // Handle emoji - must be string or null
    if (emoji !== undefined) {
      if (emoji !== null && typeof emoji !== "string") {
        return NextResponse.json(
          { error: "emoji must be a string or null" },
          { status: 400 }
        );
      }
      updates.emoji = emoji;
    }

    // Handle imageUrl - must be string or null
    if (imageUrl !== undefined) {
      if (imageUrl !== null && typeof imageUrl !== "string") {
        return NextResponse.json(
          { error: "imageUrl must be a string or null" },
          { status: 400 }
        );
      }
      updates.imageUrl = imageUrl;
    }

    // Handle isCharacterWord - must be boolean
    if (isCharacterWord !== undefined) {
      updates.isCharacterWord = Boolean(isCharacterWord);
    }

    // If updating to sight word, clear pictures and character flag
    const effectiveIsSightWord = updates.isSightWord;
    if (effectiveIsSightWord === true) {
      updates.emoji = null;
      updates.imageUrl = null;
      updates.isCharacterWord = false;
    }

    // Update word if there are field updates
    if (Object.keys(updates).length > 0) {
      const updated = await db
        .update(words)
        .set(updates)
        .where(eq(words.id, id))
        .returning();

      if (updated.length === 0) {
        return NextResponse.json(
          { error: "Word not found" },
          { status: 404 }
        );
      }

      // Adventures are computed from sentence usage, not stored associations
      return NextResponse.json({
        word: {
          ...updated[0],
          adventures: [],
        },
      });
    }

    // No updates to apply, fetch current word
    const currentWord = await db.query.words.findFirst({
      where: eq(words.id, id),
    });

    if (!currentWord) {
      return NextResponse.json(
        { error: "Word not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      word: {
        ...currentWord,
        adventures: [],
      },
    });
  } catch (error) {
    console.error("Error updating word:", error);
    return NextResponse.json(
      { error: "Failed to update word" },
      { status: 500 }
    );
  }
}

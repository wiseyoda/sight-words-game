import { NextRequest, NextResponse } from "next/server";
import { db, words } from "@/lib/db";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

const WORD_MAX_LENGTH = 50;
const ALLOWED_LEVELS = new Set([
  "pre-primer",
  "primer",
  "first-grade",
  "second-grade",
  "third-grade",
  "pictured",
  "custom",
  "generated",
]);

function isValidId(id: string | undefined) {
  return typeof id === "string" && id.length > 0 && id.length <= 100;
}

// DELETE /api/admin/words/[id] - Delete a word
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!isValidId(id)) {
      return NextResponse.json(
        { error: "Invalid word id" },
        { status: 400 }
      );
    }

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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!isValidId(id)) {
      return NextResponse.json(
        { error: "Invalid word id" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { text, level, audioUrl } = body;

    const updates: Partial<{ text: string; level: string; audioUrl: string | null }> = {};

    if (text !== undefined) {
      const normalized = typeof text === "string" ? text.trim().toLowerCase() : "";
      if (!normalized || normalized.length > WORD_MAX_LENGTH) {
        return NextResponse.json(
          { error: "Word must be a non-empty string up to 50 characters" },
          { status: 400 }
        );
      }
      updates.text = normalized;
    }

    if (level !== undefined) {
      if (!ALLOWED_LEVELS.has(level)) {
        return NextResponse.json(
          { error: "Invalid level" },
          { status: 400 }
        );
      }
      updates.level = level;
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

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No updates provided" },
        { status: 400 }
      );
    }

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

    return NextResponse.json({ word: updated[0] });
  } catch (error) {
    console.error("Error updating word:", error);
    return NextResponse.json(
      { error: "Failed to update word" },
      { status: 500 }
    );
  }
}

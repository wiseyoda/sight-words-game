import { NextRequest, NextResponse } from "next/server";
import { db, words } from "@/lib/db";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

// DELETE /api/admin/words/[id] - Delete a word
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
    const body = await request.json();
    const { text, level, audioUrl } = body;

    const updates: Partial<{ text: string; level: string; audioUrl: string | null }> = {};
    if (text !== undefined) updates.text = text.trim().toLowerCase();
    if (level !== undefined) updates.level = level;
    if (audioUrl !== undefined) updates.audioUrl = audioUrl;

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

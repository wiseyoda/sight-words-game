import { NextRequest, NextResponse } from "next/server";
import { db, sentences } from "@/lib/db";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

// DELETE /api/admin/sentences/[id] - Delete a sentence
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const deleted = await db
      .delete(sentences)
      .where(eq(sentences.id, id))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: "Sentence not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ deleted: deleted[0] });
  } catch (error) {
    console.error("Error deleting sentence:", error);
    return NextResponse.json(
      { error: "Failed to delete sentence" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/sentences/[id] - Update a sentence
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { text, orderedWords, distractors } = body;

    const updates: Partial<{ text: string; orderedWords: string[]; distractors: string[] }> = {};
    if (text !== undefined) updates.text = text.trim();
    if (orderedWords !== undefined) updates.orderedWords = orderedWords;
    if (distractors !== undefined) updates.distractors = distractors;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No updates provided" },
        { status: 400 }
      );
    }

    const updated = await db
      .update(sentences)
      .set(updates)
      .where(eq(sentences.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: "Sentence not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ sentence: updated[0] });
  } catch (error) {
    console.error("Error updating sentence:", error);
    return NextResponse.json(
      { error: "Failed to update sentence" },
      { status: 500 }
    );
  }
}

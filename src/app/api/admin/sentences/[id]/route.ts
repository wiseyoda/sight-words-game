import { NextRequest, NextResponse } from "next/server";
import { db, sentences } from "@/lib/db";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

const MAX_SENTENCE_LENGTH = 500;
const MAX_WORDS = 50;
const MAX_DISTRACTORS = 20;

function isValidId(id: string | undefined) {
  return typeof id === "string" && id.length > 0 && id.length <= 100;
}

// DELETE /api/admin/sentences/[id] - Delete a sentence
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!isValidId(id)) {
      return NextResponse.json(
        { error: "Invalid sentence id" },
        { status: 400 }
      );
    }

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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!isValidId(id)) {
      return NextResponse.json(
        { error: "Invalid sentence id" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { text, orderedWords, distractors } = body;

    const updates: Partial<{
      text: string;
      orderedWords: string[];
      distractors: string[];
      missionId: string | null;
      order: number;
    }> = {};

    // Handle missionId (can be null to unassign)
    if (body.missionId !== undefined) {
      if (body.missionId === null) {
        updates.missionId = null;
      } else if (typeof body.missionId === "string" && body.missionId.length > 0) {
        updates.missionId = body.missionId;
      } else {
        return NextResponse.json(
          { error: "missionId must be a valid string or null" },
          { status: 400 }
        );
      }
    }

    // Handle order
    if (body.order !== undefined) {
      if (typeof body.order !== "number" || body.order < 0) {
        return NextResponse.json(
          { error: "order must be a non-negative number" },
          { status: 400 }
        );
      }
      updates.order = body.order;
    }

    if (text !== undefined) {
      if (typeof text !== "string" || text.trim().length === 0 || text.length > MAX_SENTENCE_LENGTH) {
        return NextResponse.json(
          { error: "Sentence text must be a non-empty string up to 500 characters" },
          { status: 400 }
        );
      }
      updates.text = text.trim();
    }

    if (orderedWords !== undefined) {
      if (!Array.isArray(orderedWords) || orderedWords.length === 0 || orderedWords.length > MAX_WORDS) {
        return NextResponse.json(
          { error: "orderedWords must be a non-empty array with at most 50 items" },
          { status: 400 }
        );
      }
      const sanitizedWords = orderedWords
        .filter((w): w is string => typeof w === "string" && w.trim().length > 0)
        .map((w) => w.trim());
      if (sanitizedWords.length !== orderedWords.length) {
        return NextResponse.json(
          { error: "orderedWords must contain only non-empty strings" },
          { status: 400 }
        );
      }
      updates.orderedWords = sanitizedWords;
    }

    if (distractors !== undefined) {
      if (!Array.isArray(distractors) || distractors.length > MAX_DISTRACTORS) {
        return NextResponse.json(
          { error: "distractors must be an array with at most 20 items" },
          { status: 400 }
        );
      }
      const sanitizedDistractors = distractors
        .filter((d): d is string => typeof d === "string" && d.trim().length > 0)
        .map((d) => d.trim());
      updates.distractors = sanitizedDistractors;
    }

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

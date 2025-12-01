import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { missions, sentences } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import type { MissionArtwork, UnlockReward } from "@/lib/db/schema";

export const runtime = "nodejs";

const MAX_TITLE_LENGTH = 100;
const MAX_NARRATIVE_LENGTH = 2000;

function isValidId(id: string | undefined) {
  return typeof id === "string" && id.length > 0 && id.length <= 100;
}

// GET /api/admin/missions/[id] - Get mission with sentences
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!isValidId(id)) {
      return NextResponse.json(
        { error: "Invalid mission id" },
        { status: 400 }
      );
    }

    const mission = await db.query.missions.findFirst({
      where: eq(missions.id, id),
      with: {
        campaign: {
          with: {
            theme: true,
          },
        },
        sentences: {
          orderBy: [asc(sentences.order)],
        },
      },
    });

    if (!mission) {
      return NextResponse.json(
        { error: "Mission not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ mission });
  } catch (error) {
    console.error("Error fetching mission:", error);
    return NextResponse.json(
      { error: "Failed to fetch mission" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/missions/[id] - Update mission
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!isValidId(id)) {
      return NextResponse.json(
        { error: "Invalid mission id" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const updates: Partial<{
      title: string;
      type: string;
      narrativeIntro: string | null;
      narrativeOutro: string | null;
      scaffoldingLevel: number;
      artwork: MissionArtwork | null;
      unlockReward: UnlockReward | null;
      order: number;
      isActive: boolean;
    }> = {};

    if (body.title !== undefined) {
      if (typeof body.title !== "string" || body.title.trim().length === 0) {
        return NextResponse.json(
          { error: "Title must be a non-empty string" },
          { status: 400 }
        );
      }
      if (body.title.length > MAX_TITLE_LENGTH) {
        return NextResponse.json(
          { error: `Title must be at most ${MAX_TITLE_LENGTH} characters` },
          { status: 400 }
        );
      }
      updates.title = body.title.trim();
    }

    if (body.type !== undefined) {
      if (!["play", "treasure", "boss"].includes(body.type)) {
        return NextResponse.json(
          { error: "Type must be 'play', 'treasure', or 'boss'" },
          { status: 400 }
        );
      }
      updates.type = body.type;
    }

    if (body.narrativeIntro !== undefined) {
      if (body.narrativeIntro && body.narrativeIntro.length > MAX_NARRATIVE_LENGTH) {
        return NextResponse.json(
          { error: `Narrative intro must be at most ${MAX_NARRATIVE_LENGTH} characters` },
          { status: 400 }
        );
      }
      updates.narrativeIntro = body.narrativeIntro?.trim() || null;
    }

    if (body.narrativeOutro !== undefined) {
      if (body.narrativeOutro && body.narrativeOutro.length > MAX_NARRATIVE_LENGTH) {
        return NextResponse.json(
          { error: `Narrative outro must be at most ${MAX_NARRATIVE_LENGTH} characters` },
          { status: 400 }
        );
      }
      updates.narrativeOutro = body.narrativeOutro?.trim() || null;
    }

    if (body.scaffoldingLevel !== undefined) {
      if (typeof body.scaffoldingLevel !== "number" || body.scaffoldingLevel < 1 || body.scaffoldingLevel > 4) {
        return NextResponse.json(
          { error: "Scaffolding level must be between 1 and 4" },
          { status: 400 }
        );
      }
      updates.scaffoldingLevel = body.scaffoldingLevel;
    }

    if (body.artwork !== undefined) {
      updates.artwork = body.artwork as MissionArtwork;
    }

    if (body.unlockReward !== undefined) {
      updates.unlockReward = body.unlockReward as UnlockReward;
    }

    if (body.order !== undefined) {
      if (typeof body.order !== "number" || body.order < 0) {
        return NextResponse.json(
          { error: "Order must be a non-negative number" },
          { status: 400 }
        );
      }
      updates.order = body.order;
    }

    if (body.isActive !== undefined) {
      updates.isActive = Boolean(body.isActive);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No updates provided" },
        { status: 400 }
      );
    }

    const updated = await db
      .update(missions)
      .set(updates)
      .where(eq(missions.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: "Mission not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ mission: updated[0] });
  } catch (error) {
    console.error("Error updating mission:", error);
    return NextResponse.json(
      { error: "Failed to update mission" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/missions/[id] - Delete mission
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!isValidId(id)) {
      return NextResponse.json(
        { error: "Invalid mission id" },
        { status: 400 }
      );
    }

    // Check if mission exists
    const mission = await db.query.missions.findFirst({
      where: eq(missions.id, id),
    });

    if (!mission) {
      return NextResponse.json(
        { error: "Mission not found" },
        { status: 404 }
      );
    }

    // Unassign sentences
    const updatedSentences = await db
      .update(sentences)
      .set({ missionId: null })
      .where(eq(sentences.missionId, id))
      .returning();

    // Delete mission
    await db.delete(missions).where(eq(missions.id, id));

    return NextResponse.json({
      deleted: {
        missions: 1,
        sentencesUnassigned: updatedSentences.length,
      },
    });
  } catch (error) {
    console.error("Error deleting mission:", error);
    return NextResponse.json(
      { error: "Failed to delete mission" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { players, missionProgress, wordMastery, playerUnlocks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

const NAME_MAX_LENGTH = 50;

function isValidUUID(id: string | undefined): boolean {
  if (typeof id !== "string") return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/admin/players/[id] - Get a single player
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: "Invalid player id" },
        { status: 400 }
      );
    }

    const player = await db.query.players.findFirst({
      where: eq(players.id, id),
      with: {
        missionProgress: true,
        wordMastery: true,
        currentTheme: true,
        currentCampaign: true,
      },
    });

    if (!player) {
      return NextResponse.json(
        { error: "Player not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(player);
  } catch (error) {
    console.error("Error fetching player:", error);
    return NextResponse.json(
      { error: "Failed to fetch player" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/players/[id] - Update a player
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: "Invalid player id" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, avatarId, currentThemeId, currentCampaignId, currentMissionId } = body;

    const updates: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json(
          { error: "Name must be a non-empty string" },
          { status: 400 }
        );
      }
      if (name.trim().length > NAME_MAX_LENGTH) {
        return NextResponse.json(
          { error: `Name is too long (max ${NAME_MAX_LENGTH} characters)` },
          { status: 400 }
        );
      }
      updates.name = name.trim();
    }

    if (avatarId !== undefined) {
      if (avatarId !== null && typeof avatarId !== "string") {
        return NextResponse.json(
          { error: "Avatar must be a string or null" },
          { status: 400 }
        );
      }
      updates.avatarId = avatarId;
    }

    if (currentThemeId !== undefined) {
      if (currentThemeId !== null && !isValidUUID(currentThemeId)) {
        return NextResponse.json(
          { error: "Invalid theme id" },
          { status: 400 }
        );
      }
      updates.currentThemeId = currentThemeId;
    }

    if (currentCampaignId !== undefined) {
      if (currentCampaignId !== null && !isValidUUID(currentCampaignId)) {
        return NextResponse.json(
          { error: "Invalid campaign id" },
          { status: 400 }
        );
      }
      updates.currentCampaignId = currentCampaignId;
    }

    if (currentMissionId !== undefined) {
      if (currentMissionId !== null && !isValidUUID(currentMissionId)) {
        return NextResponse.json(
          { error: "Invalid mission id" },
          { status: 400 }
        );
      }
      updates.currentMissionId = currentMissionId;
    }

    const updated = await db
      .update(players)
      .set(updates)
      .where(eq(players.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: "Player not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Error updating player:", error);
    return NextResponse.json(
      { error: "Failed to update player" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/players/[id] - Delete a player and all related data
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: "Invalid player id" },
        { status: 400 }
      );
    }

    // Delete related data first (cascade)
    await db.delete(missionProgress).where(eq(missionProgress.playerId, id));
    await db.delete(wordMastery).where(eq(wordMastery.playerId, id));
    await db.delete(playerUnlocks).where(eq(playerUnlocks.playerId, id));

    // Delete the player
    const deleted = await db
      .delete(players)
      .where(eq(players.id, id))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: "Player not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ deleted: deleted[0] });
  } catch (error) {
    console.error("Error deleting player:", error);
    return NextResponse.json(
      { error: "Failed to delete player" },
      { status: 500 }
    );
  }
}

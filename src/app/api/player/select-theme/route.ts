import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { players, campaigns } from "@/lib/db/schema";
import { eq, asc, desc } from "drizzle-orm";

export const runtime = "nodejs";

const PLAYER_COOKIE_NAME = "currentPlayerId";

function isValidUUID(id: string | undefined): boolean {
  if (typeof id !== "string") return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * POST /api/player/select-theme
 * Update the current player's selected theme and set the first campaign
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { themeId } = body;

    if (!isValidUUID(themeId)) {
      return NextResponse.json(
        { error: "Invalid theme id" },
        { status: 400 }
      );
    }

    // Get the current player from cookie or most recent
    const cookieStore = await cookies();
    const playerId = cookieStore.get(PLAYER_COOKIE_NAME)?.value;

    let player = null;
    if (playerId && isValidUUID(playerId)) {
      player = await db.query.players.findFirst({
        where: eq(players.id, playerId),
      });
    }

    // Fallback to most recently active player
    if (!player) {
      player = await db.query.players.findFirst({
        orderBy: [desc(players.updatedAt)],
      });
    }

    if (!player) {
      return NextResponse.json(
        { error: "Player not found. Please create a player first." },
        { status: 404 }
      );
    }

    // Get the first campaign for this theme
    const firstCampaign = await db.query.campaigns.findFirst({
      where: eq(campaigns.themeId, themeId),
      orderBy: [asc(campaigns.order)],
    });

    // Update the player's current theme and campaign
    const updated = await db
      .update(players)
      .set({
        currentThemeId: themeId,
        currentCampaignId: firstCampaign?.id || null,
        currentMissionId: null, // Reset mission when switching themes
        updatedAt: new Date(),
      })
      .where(eq(players.id, player.id))
      .returning();

    return NextResponse.json({
      success: true,
      player: updated[0],
      campaignId: firstCampaign?.id || null,
    });
  } catch (error) {
    console.error("Error selecting theme:", error);
    return NextResponse.json(
      { error: "Failed to select theme" },
      { status: 500 }
    );
  }
}

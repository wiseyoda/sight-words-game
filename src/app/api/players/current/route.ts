import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { players } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export const runtime = "nodejs";

const PLAYER_COOKIE_NAME = "currentPlayerId";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function isValidUUID(id: string | undefined): boolean {
  if (typeof id !== "string") return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

// GET /api/players/current - Get current player from cookie
export async function GET() {
  try {
    const cookieStore = await cookies();
    const playerId = cookieStore.get(PLAYER_COOKIE_NAME)?.value;

    if (playerId && isValidUUID(playerId)) {
      // Try to find the player
      const player = await db.query.players.findFirst({
        where: eq(players.id, playerId),
        with: {
          currentTheme: true,
          currentCampaign: true,
        },
      });

      if (player) {
        return NextResponse.json({ player });
      }
    }

    // No valid player in cookie, try to get the most recent player
    const recentPlayer = await db.query.players.findFirst({
      orderBy: [desc(players.updatedAt)],
      with: {
        currentTheme: true,
        currentCampaign: true,
      },
    });

    if (recentPlayer) {
      // Set the cookie for the most recent player
      const response = NextResponse.json({ player: recentPlayer });
      response.cookies.set(PLAYER_COOKIE_NAME, recentPlayer.id, {
        maxAge: COOKIE_MAX_AGE,
        httpOnly: false, // Allow client-side access
        sameSite: "lax",
        path: "/",
      });
      return response;
    }

    // No players exist
    return NextResponse.json({ player: null });
  } catch (error) {
    console.error("Error fetching current player:", error);
    return NextResponse.json(
      { error: "Failed to fetch current player" },
      { status: 500 }
    );
  }
}

// POST /api/players/current - Set current player
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { playerId } = body;

    if (!playerId || !isValidUUID(playerId)) {
      return NextResponse.json(
        { error: "Valid playerId is required" },
        { status: 400 }
      );
    }

    // Verify player exists
    const player = await db.query.players.findFirst({
      where: eq(players.id, playerId),
      with: {
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

    // Update the player's updatedAt to mark as recently active
    await db
      .update(players)
      .set({ updatedAt: new Date() })
      .where(eq(players.id, playerId));

    // Set the cookie
    const response = NextResponse.json({ player });
    response.cookies.set(PLAYER_COOKIE_NAME, playerId, {
      maxAge: COOKIE_MAX_AGE,
      httpOnly: false, // Allow client-side access
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error setting current player:", error);
    return NextResponse.json(
      { error: "Failed to set current player" },
      { status: 500 }
    );
  }
}

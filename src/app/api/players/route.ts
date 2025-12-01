import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { players } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export const runtime = "nodejs";

const NAME_MAX_LENGTH = 50;
const MAX_PLAYERS = 5;

// GET /api/players - List all players
export async function GET() {
  try {
    const allPlayers = await db
      .select({
        id: players.id,
        name: players.name,
        avatarId: players.avatarId,
        totalStars: players.totalStars,
        currentThemeId: players.currentThemeId,
        updatedAt: players.updatedAt,
      })
      .from(players)
      .orderBy(desc(players.updatedAt));

    return NextResponse.json({ players: allPlayers });
  } catch (error) {
    console.error("Error fetching players:", error);
    return NextResponse.json(
      { error: "Failed to fetch players" },
      { status: 500 }
    );
  }
}

// POST /api/players - Create a new player
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, avatarId } = body;

    // Validate name
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Player name is required" },
        { status: 400 }
      );
    }

    if (name.trim().length > NAME_MAX_LENGTH) {
      return NextResponse.json(
        { error: `Name is too long (max ${NAME_MAX_LENGTH} characters)` },
        { status: 400 }
      );
    }

    // Validate avatarId if provided
    if (avatarId !== undefined && avatarId !== null && typeof avatarId !== "string") {
      return NextResponse.json(
        { error: "Invalid avatar" },
        { status: 400 }
      );
    }

    // Check player limit
    const existingPlayers = await db.select().from(players);
    if (existingPlayers.length >= MAX_PLAYERS) {
      return NextResponse.json(
        { error: `Maximum of ${MAX_PLAYERS} players reached` },
        { status: 400 }
      );
    }

    // Create the player
    const [newPlayer] = await db
      .insert(players)
      .values({
        name: name.trim(),
        avatarId: avatarId || null,
        totalStars: 0,
        totalPlayTimeSeconds: 0,
      })
      .returning();

    return NextResponse.json(newPlayer, { status: 201 });
  } catch (error) {
    console.error("Error creating player:", error);
    return NextResponse.json(
      { error: "Failed to create player" },
      { status: 500 }
    );
  }
}

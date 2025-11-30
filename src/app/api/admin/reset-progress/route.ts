import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { missionProgress, wordMastery, players } from "@/lib/db/schema";
import { cookies } from "next/headers";

export const runtime = "nodejs";

const ADMIN_SESSION_COOKIE = "admin_session";

// Verify admin session before allowing destructive operations
async function verifyAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE);

  if (!session?.value) {
    return false;
  }

  try {
    const sessionData = JSON.parse(session.value);
    const expiresAt = new Date(sessionData.expiresAt);
    return expiresAt > new Date();
  } catch {
    return false;
  }
}

// POST /api/admin/reset-progress - Reset all player progress
export async function POST(request: NextRequest) {
  // Verify admin session
  const isAuthed = await verifyAdminSession();
  if (!isAuthed) {
    return NextResponse.json(
      { error: "Unauthorized - admin session required" },
      { status: 401 }
    );
  }

  try {
    // Optional: reset specific player only
    const body = await request.json().catch(() => ({}));
    const playerId = body.playerId;

    if (playerId) {
      // Validate playerId format (UUID)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(playerId)) {
        return NextResponse.json(
          { error: "Invalid player ID format" },
          { status: 400 }
        );
      }

      // Reset specific player's progress
      const { eq } = await import("drizzle-orm");

      await db.delete(missionProgress).where(eq(missionProgress.playerId, playerId));
      await db.delete(wordMastery).where(eq(wordMastery.playerId, playerId));

      // Reset player stats
      await db.update(players)
        .set({
          totalStars: 0,
          totalPlayTimeSeconds: 0,
          updatedAt: new Date(),
        })
        .where(eq(players.id, playerId));

      return NextResponse.json({
        success: true,
        message: `Progress reset for player ${playerId}`
      });
    }

    // Reset ALL progress
    await db.delete(missionProgress);
    await db.delete(wordMastery);

    // Reset all player stats
    await db.update(players).set({
      totalStars: 0,
      totalPlayTimeSeconds: 0,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "All progress has been reset"
    });
  } catch (error) {
    console.error("Error resetting progress:", error);
    return NextResponse.json(
      { error: "Failed to reset progress" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { players, themes, campaigns, missions, missionProgress } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export const runtime = "nodejs";

const PLAYER_COOKIE_NAME = "currentPlayerId";

function isValidUUID(id: string | undefined): boolean {
  if (typeof id !== "string") return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

interface ThemeProgress {
  themeId: string;
  totalMissions: number;
  completedMissions: number;
  totalStars: number;
  maxStars: number;
}

/**
 * GET /api/players/progress-by-theme
 * Returns the current player's progress grouped by theme
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const playerId = cookieStore.get(PLAYER_COOKIE_NAME)?.value;

    let player = null;

    // Get player from cookie or most recent
    if (playerId && isValidUUID(playerId)) {
      player = await db.query.players.findFirst({
        where: eq(players.id, playerId),
      });
    }

    if (!player) {
      player = await db.query.players.findFirst({
        orderBy: [desc(players.updatedAt)],
      });
    }

    if (!player) {
      return NextResponse.json({ progress: {} });
    }

    // Get all themes with their campaigns and missions
    const allThemes = await db.query.themes.findMany({
      with: {
        campaigns: {
          with: {
            missions: true,
          },
        },
      },
    });

    // Get player's completed missions with stars
    const playerProgress = await db
      .select({
        missionId: missionProgress.missionId,
        stars: missionProgress.stars,
      })
      .from(missionProgress)
      .where(eq(missionProgress.playerId, player.id));

    // Create a map of completed missions
    const completedMissions = new Map<string, number>();
    playerProgress.forEach((p) => {
      completedMissions.set(p.missionId, p.stars || 0);
    });

    // Calculate progress for each theme
    const progressByTheme: Record<string, ThemeProgress> = {};

    for (const theme of allThemes) {
      let totalMissions = 0;
      let completed = 0;
      let totalStars = 0;

      for (const campaign of theme.campaigns || []) {
        for (const mission of campaign.missions || []) {
          totalMissions++;
          if (completedMissions.has(mission.id)) {
            completed++;
            totalStars += completedMissions.get(mission.id) || 0;
          }
        }
      }

      progressByTheme[theme.id] = {
        themeId: theme.id,
        totalMissions,
        completedMissions: completed,
        totalStars,
        maxStars: totalMissions * 3,
      };
    }

    return NextResponse.json({
      playerId: player.id,
      progress: progressByTheme,
    });
  } catch (error) {
    console.error("Error fetching progress by theme:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 }
    );
  }
}

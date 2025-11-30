import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { players, missions, missionProgress, playerUnlocks, campaigns } from "@/lib/db/schema";
import { eq, and, asc, sql } from "drizzle-orm";

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET /api/progress - Get player's campaign progress
export async function GET(request: NextRequest) {
  try {
    const playerId = request.nextUrl.searchParams.get("playerId");

    if (!playerId) {
      return NextResponse.json({ error: "Player ID required" }, { status: 400 });
    }

    // Validate UUID format
    if (!UUID_REGEX.test(playerId)) {
      return NextResponse.json({ error: "Invalid player ID format" }, { status: 400 });
    }

    // Get player with current theme/campaign/mission
    const player = await db.query.players.findFirst({
      where: eq(players.id, playerId),
      with: {
        currentTheme: true,
        currentCampaign: true,
        currentMission: true,
      },
    });

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    // Get campaign ID - use player's current campaign or find first available
    let campaignId = player.currentCampaignId;

    // If no current campaign, try to find one for the player's theme or any available
    if (!campaignId) {
      let defaultCampaign = null;

      // First try to find a campaign for the player's theme
      if (player.currentThemeId) {
        defaultCampaign = await db.query.campaigns.findFirst({
          where: eq(campaigns.themeId, player.currentThemeId),
          orderBy: [asc(campaigns.order)],
        });
      }

      // If no theme-specific campaign, get any campaign
      if (!defaultCampaign) {
        defaultCampaign = await db.query.campaigns.findFirst({
          orderBy: [asc(campaigns.order)],
        });
      }

      if (defaultCampaign) {
        campaignId = defaultCampaign.id;
        // Update player's current campaign
        await db.update(players)
          .set({ currentCampaignId: campaignId })
          .where(eq(players.id, playerId));
      }
    }

    // Get all missions for the campaign
    let campaignMissions: typeof missions.$inferSelect[] = [];
    if (campaignId) {
      campaignMissions = await db.query.missions.findMany({
        where: eq(missions.campaignId, campaignId),
        orderBy: [asc(missions.order)],
      });
    }

    // Get player's mission progress
    const progress = await db.query.missionProgress.findMany({
      where: eq(missionProgress.playerId, playerId),
    });

    const progressMap = new Map(progress.map(p => [p.missionId, p]));

    // Get player's unlocks
    const unlocks = await db.query.playerUnlocks.findMany({
      where: eq(playerUnlocks.playerId, playerId),
    });

    // Build mission status list
    const missionStatuses = campaignMissions.map((mission, index) => {
      const missionProgress = progressMap.get(mission.id);
      const isCompleted = !!missionProgress;

      // A mission is unlocked if:
      // - It's the first mission, OR
      // - The previous mission is completed, OR
      // - It's the boss and all previous missions are completed
      let isUnlocked = index === 0;
      if (index > 0) {
        const prevMission = campaignMissions[index - 1];
        isUnlocked = progressMap.has(prevMission.id);
      }

      // Special case for boss: all previous must be complete
      if (mission.type === "boss") {
        isUnlocked = campaignMissions
          .filter(m => m.type !== "boss")
          .every(m => progressMap.has(m.id));
      }

      return {
        missionId: mission.id,
        title: mission.title,
        type: mission.type,
        order: mission.order,
        isCompleted,
        isUnlocked,
        isCurrent: mission.id === player.currentMissionId,
        stars: missionProgress?.stars || 0,
        completedAt: missionProgress?.completedAt || null,
      };
    });

    return NextResponse.json({
      playerId: player.id,
      playerName: player.name,
      currentTheme: player.currentTheme ? {
        id: player.currentTheme.id,
        name: player.currentTheme.name,
        displayName: player.currentTheme.displayName,
      } : null,
      currentCampaign: player.currentCampaign ? {
        id: player.currentCampaign.id,
        title: player.currentCampaign.title,
        synopsis: player.currentCampaign.synopsis,
      } : null,
      currentMissionId: player.currentMissionId,
      totalStars: player.totalStars,
      missions: missionStatuses,
      unlocks: unlocks.map(u => ({
        type: u.unlockType,
        id: u.unlockId,
        unlockedAt: u.unlockedAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 }
    );
  }
}

// POST /api/progress - Record mission completion
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { playerId, missionId, starsEarned } = body;

    // Validate required fields
    if (!playerId || typeof playerId !== "string") {
      return NextResponse.json(
        { error: "Valid playerId is required" },
        { status: 400 }
      );
    }
    if (!missionId || typeof missionId !== "string") {
      return NextResponse.json(
        { error: "Valid missionId is required" },
        { status: 400 }
      );
    }
    if (typeof starsEarned !== "number" || starsEarned < 0 || starsEarned > 3) {
      return NextResponse.json(
        { error: "starsEarned must be a number between 0 and 3" },
        { status: 400 }
      );
    }

    // Validate UUID format to prevent injection
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(playerId) || !uuidRegex.test(missionId)) {
      return NextResponse.json(
        { error: "Invalid ID format" },
        { status: 400 }
      );
    }

    // Validate stars (clamp to valid range)
    const stars = Math.min(3, Math.max(1, Math.round(starsEarned)));

    // Verify player exists
    const player = await db.query.players.findFirst({
      where: eq(players.id, playerId),
    });

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    // Get the mission to find the next one
    const mission = await db.query.missions.findFirst({
      where: eq(missions.id, missionId),
    });

    if (!mission) {
      return NextResponse.json({ error: "Mission not found" }, { status: 404 });
    }

    // Check if progress already exists (update vs insert)
    const existingProgress = await db.query.missionProgress.findFirst({
      where: and(
        eq(missionProgress.playerId, playerId),
        eq(missionProgress.missionId, missionId)
      ),
    });

    if (existingProgress) {
      // Update only if new stars are better
      if (stars > (existingProgress.stars ?? 0)) {
        await db
          .update(missionProgress)
          .set({ stars, completedAt: new Date() })
          .where(eq(missionProgress.id, existingProgress.id));
      }
    } else {
      // Insert new progress
      await db.insert(missionProgress).values({
        playerId,
        missionId,
        stars,
        completedAt: new Date(),
      });
    }

    // Handle unlock rewards
    if (mission.unlockReward) {
      const existingUnlock = await db.query.playerUnlocks.findFirst({
        where: and(
          eq(playerUnlocks.playerId, playerId),
          eq(playerUnlocks.unlockId, mission.unlockReward.id)
        ),
      });

      if (!existingUnlock) {
        await db.insert(playerUnlocks).values({
          playerId,
          unlockType: mission.unlockReward.type,
          unlockId: mission.unlockReward.id,
          unlockedAt: new Date(),
        });
      }
    }

    // Find next mission
    let nextMissionId: string | null = null;
    if (mission.campaignId) {
      const nextMission = await db.query.missions.findFirst({
        where: and(
          eq(missions.campaignId, mission.campaignId),
          eq(missions.order, (mission.order ?? 0) + 1)
        ),
      });
      nextMissionId = nextMission?.id || null;
    }

    // Update player's current mission and total stars
    const allProgress = await db.query.missionProgress.findMany({
      where: eq(missionProgress.playerId, playerId),
    });
    const totalStars = allProgress.reduce((sum, p) => sum + (p.stars || 0), 0);

    await db
      .update(players)
      .set({
        currentMissionId: nextMissionId || mission.id,
        totalStars,
        updatedAt: new Date(),
      })
      .where(eq(players.id, playerId));

    return NextResponse.json({
      success: true,
      starsEarned: stars,
      totalStars,
      nextMissionId,
      unlockReward: mission.unlockReward || null,
    });
  } catch (error) {
    console.error("Error recording progress:", error);
    return NextResponse.json(
      { error: "Failed to record progress" },
      { status: 500 }
    );
  }
}

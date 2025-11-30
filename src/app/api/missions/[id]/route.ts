import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { missions, sentences, campaigns, themes, missionProgress } from "@/lib/db/schema";
import { eq, and, asc, lt } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Invalid mission ID" }, { status: 400 });
    }

    // Get mission with campaign and theme
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
      return NextResponse.json({ error: "Mission not found" }, { status: 404 });
    }

    // Check if boss mission is locked (requires all previous missions completed)
    if (mission.type === "boss") {
      const playerId = request.headers.get("x-player-id");
      if (playerId) {
        // Get all other missions in this campaign
        const campaignMissions = await db.query.missions.findMany({
          where: and(
            eq(missions.campaignId, mission.campaignId!),
            lt(missions.order, mission.order ?? 0)
          ),
        });

        // Check completion status
        const completedProgress = await db.query.missionProgress.findMany({
          where: eq(missionProgress.playerId, playerId),
        });

        const completedIds = new Set(completedProgress.map(p => p.missionId));
        const allPreviousComplete = campaignMissions.every(m => completedIds.has(m.id));

        if (!allPreviousComplete) {
          return NextResponse.json(
            { error: "Boss mission is locked. Complete all previous missions first." },
            { status: 403 }
          );
        }
      }
    }

    // Format response
    const response = {
      id: mission.id,
      title: mission.title,
      type: mission.type,
      narrativeIntro: mission.narrativeIntro,
      narrativeOutro: mission.narrativeOutro,
      scaffoldingLevel: mission.scaffoldingLevel,
      unlockReward: mission.unlockReward,
      order: mission.order,
      sentences: mission.sentences.map(s => ({
        id: s.id,
        text: s.text,
        orderedWords: s.orderedWords,
        distractors: s.distractors,
        order: s.order,
      })),
      theme: mission.campaign?.theme ? {
        id: mission.campaign.theme.id,
        name: mission.campaign.theme.name,
        displayName: mission.campaign.theme.displayName,
        palette: mission.campaign.theme.palette,
        assets: mission.campaign.theme.assets,
        characters: mission.campaign.theme.characters,
        feedbackPhrases: mission.campaign.theme.feedbackPhrases,
        feedbackAudioUrls: mission.campaign.theme.feedbackAudioUrls,
      } : null,
      campaign: mission.campaign ? {
        id: mission.campaign.id,
        title: mission.campaign.title,
      } : null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching mission:", error);
    return NextResponse.json(
      { error: "Failed to fetch mission" },
      { status: 500 }
    );
  }
}

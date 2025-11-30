import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { themes, campaigns, missions, sentences } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  try {
    // Get all themes with their campaigns, missions, and sentences
    const allThemes = await db.query.themes.findMany({
      orderBy: [asc(themes.name)],
    });

    // For each theme, get campaigns, missions, and sentences
    const themesWithDetails = await Promise.all(
      allThemes.map(async (theme) => {
        const themeCampaigns = await db.query.campaigns.findMany({
          where: eq(campaigns.themeId, theme.id),
          orderBy: [asc(campaigns.order)],
        });

        const campaignsWithMissions = await Promise.all(
          themeCampaigns.map(async (campaign) => {
            const campaignMissions = await db.query.missions.findMany({
              where: eq(missions.campaignId, campaign.id),
              orderBy: [asc(missions.order)],
            });

            const missionsWithSentences = await Promise.all(
              campaignMissions.map(async (mission) => {
                const missionSentences = await db.query.sentences.findMany({
                  where: eq(sentences.missionId, mission.id),
                  orderBy: [asc(sentences.order)],
                });

                return {
                  ...mission,
                  sentences: missionSentences,
                };
              })
            );

            return {
              ...campaign,
              missions: missionsWithSentences,
            };
          })
        );

        return {
          ...theme,
          campaigns: campaignsWithMissions,
        };
      })
    );

    return NextResponse.json({ themes: themesWithDetails });
  } catch (error) {
    console.error("Error fetching themes for admin:", error);
    return NextResponse.json(
      { error: "Failed to fetch themes" },
      { status: 500 }
    );
  }
}

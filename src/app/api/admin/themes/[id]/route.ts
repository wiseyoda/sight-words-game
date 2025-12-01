import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { themes, campaigns, missions, sentences } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import type { ThemePalette, ThemeAssets, ThemeCharacter, FeedbackPhrases } from "@/lib/db/schema";

export const runtime = "nodejs";

function isValidId(id: string | undefined) {
  return typeof id === "string" && id.length > 0 && id.length <= 100;
}

// GET /api/admin/themes/[id] - Get full theme with nested campaigns and missions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!isValidId(id)) {
      return NextResponse.json(
        { error: "Invalid theme id" },
        { status: 400 }
      );
    }

    const theme = await db.query.themes.findFirst({
      where: eq(themes.id, id),
    });

    if (!theme) {
      return NextResponse.json(
        { error: "Theme not found" },
        { status: 404 }
      );
    }

    // Get campaigns with missions and sentence counts
    const themeCampaigns = await db.query.campaigns.findMany({
      where: eq(campaigns.themeId, id),
      orderBy: [asc(campaigns.order)],
    });

    const campaignsWithMissions = await Promise.all(
      themeCampaigns.map(async (campaign) => {
        const campaignMissions = await db.query.missions.findMany({
          where: eq(missions.campaignId, campaign.id),
          orderBy: [asc(missions.order)],
        });

        const missionsWithSentenceCount = await Promise.all(
          campaignMissions.map(async (mission) => {
            const missionSentences = await db.query.sentences.findMany({
              where: eq(sentences.missionId, mission.id),
            });

            return {
              id: mission.id,
              title: mission.title,
              type: mission.type,
              order: mission.order,
              artwork: mission.artwork,
              sentenceCount: missionSentences.length,
            };
          })
        );

        return {
          id: campaign.id,
          title: campaign.title,
          synopsis: campaign.synopsis,
          artwork: campaign.artwork,
          order: campaign.order,
          missions: missionsWithSentenceCount,
        };
      })
    );

    return NextResponse.json({
      theme: {
        ...theme,
        campaigns: campaignsWithMissions,
      },
    });
  } catch (error) {
    console.error("Error fetching theme:", error);
    return NextResponse.json(
      { error: "Failed to fetch theme" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/themes/[id] - Update theme properties
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!isValidId(id)) {
      return NextResponse.json(
        { error: "Invalid theme id" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Build updates object
    const updates: Partial<{
      name: string;
      displayName: string;
      palette: ThemePalette;
      assets: ThemeAssets;
      characters: ThemeCharacter[];
      feedbackPhrases: FeedbackPhrases;
      isActive: boolean;
    }> = {};

    if (body.name !== undefined) {
      if (typeof body.name !== "string" || body.name.trim().length === 0) {
        return NextResponse.json(
          { error: "Name must be a non-empty string" },
          { status: 400 }
        );
      }
      updates.name = body.name.trim();
    }

    if (body.displayName !== undefined) {
      if (typeof body.displayName !== "string" || body.displayName.trim().length === 0) {
        return NextResponse.json(
          { error: "Display name must be a non-empty string" },
          { status: 400 }
        );
      }
      updates.displayName = body.displayName.trim();
    }

    if (body.palette !== undefined) {
      updates.palette = body.palette as ThemePalette;
    }

    if (body.assets !== undefined) {
      updates.assets = body.assets as ThemeAssets;
    }

    if (body.characters !== undefined) {
      if (!Array.isArray(body.characters)) {
        return NextResponse.json(
          { error: "Characters must be an array" },
          { status: 400 }
        );
      }
      updates.characters = body.characters as ThemeCharacter[];
    }

    if (body.feedbackPhrases !== undefined) {
      updates.feedbackPhrases = body.feedbackPhrases as FeedbackPhrases;
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
      .update(themes)
      .set(updates)
      .where(eq(themes.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: "Theme not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ theme: updated[0] });
  } catch (error) {
    console.error("Error updating theme:", error);
    return NextResponse.json(
      { error: "Failed to update theme" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/themes/[id] - Delete theme and cascade
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!isValidId(id)) {
      return NextResponse.json(
        { error: "Invalid theme id" },
        { status: 400 }
      );
    }

    // Check if theme exists
    const theme = await db.query.themes.findFirst({
      where: eq(themes.id, id),
    });

    if (!theme) {
      return NextResponse.json(
        { error: "Theme not found" },
        { status: 404 }
      );
    }

    // Count entities that will be affected
    const themeCampaigns = await db.query.campaigns.findMany({
      where: eq(campaigns.themeId, id),
    });

    let missionCount = 0;
    let sentencesUnassigned = 0;

    for (const campaign of themeCampaigns) {
      const campaignMissions = await db.query.missions.findMany({
        where: eq(missions.campaignId, campaign.id),
      });

      missionCount += campaignMissions.length;

      for (const mission of campaignMissions) {
        // Unassign sentences (set missionId to null)
        const updatedSentences = await db
          .update(sentences)
          .set({ missionId: null })
          .where(eq(sentences.missionId, mission.id))
          .returning();

        sentencesUnassigned += updatedSentences.length;
      }

      // Delete missions
      await db.delete(missions).where(eq(missions.campaignId, campaign.id));
    }

    // Delete campaigns
    await db.delete(campaigns).where(eq(campaigns.themeId, id));

    // Delete theme
    await db.delete(themes).where(eq(themes.id, id));

    return NextResponse.json({
      deleted: {
        themes: 1,
        campaigns: themeCampaigns.length,
        missions: missionCount,
        sentencesUnassigned,
      },
    });
  } catch (error) {
    console.error("Error deleting theme:", error);
    return NextResponse.json(
      { error: "Failed to delete theme" },
      { status: 500 }
    );
  }
}

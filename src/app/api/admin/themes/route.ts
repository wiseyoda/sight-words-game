import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { themes, campaigns, missions, sentences } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import type { ThemePalette, ThemeAssets, ThemeCharacter, FeedbackPhrases } from "@/lib/db/schema";

export const runtime = "nodejs";

const MAX_NAME_LENGTH = 50;
const MAX_DISPLAY_NAME_LENGTH = 100;

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

// POST /api/admin/themes - Create a new theme
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || typeof body.name !== "string" || body.name.trim().length === 0) {
      return NextResponse.json(
        { error: "Theme name is required" },
        { status: 400 }
      );
    }

    if (body.name.length > MAX_NAME_LENGTH) {
      return NextResponse.json(
        { error: `Theme name must be at most ${MAX_NAME_LENGTH} characters` },
        { status: 400 }
      );
    }

    if (!body.displayName || typeof body.displayName !== "string" || body.displayName.trim().length === 0) {
      return NextResponse.json(
        { error: "Theme display name is required" },
        { status: 400 }
      );
    }

    if (body.displayName.length > MAX_DISPLAY_NAME_LENGTH) {
      return NextResponse.json(
        { error: `Theme display name must be at most ${MAX_DISPLAY_NAME_LENGTH} characters` },
        { status: 400 }
      );
    }

    // Validate name format (lowercase, alphanumeric with dashes)
    const namePattern = /^[a-z0-9-]+$/;
    if (!namePattern.test(body.name.trim())) {
      return NextResponse.json(
        { error: "Theme name must be lowercase alphanumeric with dashes only" },
        { status: 400 }
      );
    }

    // Check for existing theme with same name
    const existingTheme = await db.query.themes.findFirst({
      where: eq(themes.name, body.name.trim()),
    });

    if (existingTheme) {
      return NextResponse.json(
        { error: "Theme with this name already exists" },
        { status: 409 }
      );
    }

    // Validate characters array if provided
    if (body.characters !== undefined && !Array.isArray(body.characters)) {
      return NextResponse.json(
        { error: "Characters must be an array" },
        { status: 400 }
      );
    }

    // Create theme
    const [newTheme] = await db
      .insert(themes)
      .values({
        name: body.name.trim(),
        displayName: body.displayName.trim(),
        palette: (body.palette || null) as ThemePalette | null,
        assets: (body.assets || null) as ThemeAssets | null,
        characters: (body.characters || null) as ThemeCharacter[] | null,
        feedbackPhrases: (body.feedbackPhrases || null) as FeedbackPhrases | null,
        isActive: body.isActive ?? true,
        isCustom: body.isCustom ?? true,
      })
      .returning();

    return NextResponse.json({ theme: newTheme }, { status: 201 });
  } catch (error) {
    console.error("Error creating theme:", error);
    return NextResponse.json(
      { error: "Failed to create theme" },
      { status: 500 }
    );
  }
}

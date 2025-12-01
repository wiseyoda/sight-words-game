import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { missions, sentences, campaigns } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";
import type { MissionArtwork, UnlockReward } from "@/lib/db/schema";

export const runtime = "nodejs";

const MAX_TITLE_LENGTH = 100;
const MAX_NARRATIVE_LENGTH = 2000;

function isValidId(id: string | undefined) {
  return typeof id === "string" && id.length > 0 && id.length <= 100;
}

// GET /api/admin/missions - List all missions
export async function GET() {
  try {
    const allMissions = await db.query.missions.findMany({
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
      orderBy: [asc(missions.order)],
    });

    return NextResponse.json({ missions: allMissions });
  } catch (error) {
    console.error("Error fetching missions:", error);
    return NextResponse.json(
      { error: "Failed to fetch missions" },
      { status: 500 }
    );
  }
}

// POST /api/admin/missions - Create a new mission
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.campaignId) {
      return NextResponse.json(
        { error: "Campaign ID is required" },
        { status: 400 }
      );
    }

    if (!isValidId(body.campaignId)) {
      return NextResponse.json(
        { error: "Invalid campaign ID" },
        { status: 400 }
      );
    }

    if (!body.title || typeof body.title !== "string" || body.title.trim().length === 0) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (body.title.length > MAX_TITLE_LENGTH) {
      return NextResponse.json(
        { error: `Title must be at most ${MAX_TITLE_LENGTH} characters` },
        { status: 400 }
      );
    }

    // Verify campaign exists
    const campaign = await db.query.campaigns.findFirst({
      where: eq(campaigns.id, body.campaignId),
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Get current max order for the campaign
    const existingMissions = await db.query.missions.findMany({
      where: eq(missions.campaignId, body.campaignId),
    });
    const nextOrder = existingMissions.length > 0
      ? Math.max(...existingMissions.map(m => m.order ?? 0)) + 1
      : 0;

    // Validate optional fields
    const missionType = body.type || "play";
    if (!["play", "treasure", "boss"].includes(missionType)) {
      return NextResponse.json(
        { error: "Type must be 'play', 'treasure', or 'boss'" },
        { status: 400 }
      );
    }

    if (body.narrativeIntro && body.narrativeIntro.length > MAX_NARRATIVE_LENGTH) {
      return NextResponse.json(
        { error: `Narrative intro must be at most ${MAX_NARRATIVE_LENGTH} characters` },
        { status: 400 }
      );
    }

    if (body.narrativeOutro && body.narrativeOutro.length > MAX_NARRATIVE_LENGTH) {
      return NextResponse.json(
        { error: `Narrative outro must be at most ${MAX_NARRATIVE_LENGTH} characters` },
        { status: 400 }
      );
    }

    // Create mission
    const [newMission] = await db
      .insert(missions)
      .values({
        title: body.title.trim(),
        type: missionType,
        narrativeIntro: body.narrativeIntro?.trim() || null,
        narrativeOutro: body.narrativeOutro?.trim() || null,
        campaignId: body.campaignId,
        order: body.order ?? nextOrder,
        scaffoldingLevel: body.scaffoldingLevel ?? 1,
        artwork: body.artwork as MissionArtwork || null,
        unlockReward: body.unlockReward as UnlockReward || null,
        isActive: body.isActive ?? true,
      })
      .returning();

    return NextResponse.json({ mission: newMission }, { status: 201 });
  } catch (error) {
    console.error("Error creating mission:", error);
    return NextResponse.json(
      { error: "Failed to create mission" },
      { status: 500 }
    );
  }
}

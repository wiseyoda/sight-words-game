import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { campaigns, missions, sentences } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import type { CampaignArtwork } from "@/lib/db/schema";

export const runtime = "nodejs";

function isValidId(id: string | undefined) {
  return typeof id === "string" && id.length > 0 && id.length <= 100;
}

// GET /api/admin/campaigns/[id] - Get campaign with missions
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!isValidId(id)) {
      return NextResponse.json(
        { error: "Invalid campaign id" },
        { status: 400 }
      );
    }

    const campaign = await db.query.campaigns.findFirst({
      where: eq(campaigns.id, id),
      with: {
        theme: true,
        missions: {
          orderBy: [asc(missions.order)],
          with: {
            sentences: {
              orderBy: [asc(sentences.order)],
            },
          },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaign" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/campaigns/[id] - Update campaign
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!isValidId(id)) {
      return NextResponse.json(
        { error: "Invalid campaign id" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const updates: Partial<{
      title: string;
      synopsis: string;
      artwork: CampaignArtwork;
      order: number;
      isActive: boolean;
    }> = {};

    if (body.title !== undefined) {
      if (typeof body.title !== "string" || body.title.trim().length === 0) {
        return NextResponse.json(
          { error: "Title must be a non-empty string" },
          { status: 400 }
        );
      }
      updates.title = body.title.trim();
    }

    if (body.synopsis !== undefined) {
      updates.synopsis = body.synopsis?.trim() || null;
    }

    if (body.artwork !== undefined) {
      updates.artwork = body.artwork as CampaignArtwork;
    }

    if (body.order !== undefined) {
      if (typeof body.order !== "number" || body.order < 0) {
        return NextResponse.json(
          { error: "Order must be a non-negative number" },
          { status: 400 }
        );
      }
      updates.order = body.order;
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
      .update(campaigns)
      .set(updates)
      .where(eq(campaigns.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ campaign: updated[0] });
  } catch (error) {
    console.error("Error updating campaign:", error);
    return NextResponse.json(
      { error: "Failed to update campaign" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/campaigns/[id] - Delete campaign and cascade
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!isValidId(id)) {
      return NextResponse.json(
        { error: "Invalid campaign id" },
        { status: 400 }
      );
    }

    // Check if campaign exists
    const campaign = await db.query.campaigns.findFirst({
      where: eq(campaigns.id, id),
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Get missions
    const campaignMissions = await db.query.missions.findMany({
      where: eq(missions.campaignId, id),
    });

    let sentencesUnassigned = 0;

    for (const mission of campaignMissions) {
      // Unassign sentences
      const updatedSentences = await db
        .update(sentences)
        .set({ missionId: null })
        .where(eq(sentences.missionId, mission.id))
        .returning();

      sentencesUnassigned += updatedSentences.length;
    }

    // Delete missions
    await db.delete(missions).where(eq(missions.campaignId, id));

    // Delete campaign
    await db.delete(campaigns).where(eq(campaigns.id, id));

    return NextResponse.json({
      deleted: {
        campaigns: 1,
        missions: campaignMissions.length,
        sentencesUnassigned,
      },
    });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    return NextResponse.json(
      { error: "Failed to delete campaign" },
      { status: 500 }
    );
  }
}

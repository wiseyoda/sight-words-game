import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { db } from "@/lib/db";
import { themes, campaigns, missions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { ThemeAssets, ThemeCharacter, CampaignArtwork, MissionArtwork } from "@/lib/db/schema";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_CONTENT_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];

// Artwork slot definitions
type ThemeArtworkSlot = "logo" | "background" | "mapBackground";
type CharacterArtworkSlot = "imageUrl" | "thumbnailUrl";
type CampaignArtworkSlot = "background" | "introImage";
type MissionArtworkSlot = "introImage" | "outroImage";

type ArtworkTarget =
  | { type: "theme"; themeId: string; slot: ThemeArtworkSlot }
  | { type: "character"; themeId: string; characterId: string; slot: CharacterArtworkSlot }
  | { type: "campaign"; campaignId: string; slot: CampaignArtworkSlot }
  | { type: "mission"; missionId: string; slot: MissionArtworkSlot };

function getExtension(contentType: string): string {
  const extensions: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/webp": "webp",
  };
  return extensions[contentType] || "png";
}

function generateFilename(target: ArtworkTarget, extension: string): string {
  const timestamp = Date.now();

  switch (target.type) {
    case "theme":
      return `themes/${target.themeId}/${target.slot}-${timestamp}.${extension}`;
    case "character":
      return `themes/${target.themeId}/characters/${target.characterId}-${target.slot}-${timestamp}.${extension}`;
    case "campaign":
      return `campaigns/${target.campaignId}/${target.slot}-${timestamp}.${extension}`;
    case "mission":
      return `missions/${target.missionId}/${target.slot}-${timestamp}.${extension}`;
  }
}

async function updateThemeAsset(themeId: string, slot: ThemeArtworkSlot, url: string) {
  const theme = await db.query.themes.findFirst({
    where: eq(themes.id, themeId),
  });

  if (!theme) throw new Error("Theme not found");

  const currentAssets = (theme.assets || {}) as ThemeAssets;
  const updatedAssets: ThemeAssets = {
    ...currentAssets,
    [slot]: url,
  };

  await db.update(themes)
    .set({ assets: updatedAssets })
    .where(eq(themes.id, themeId));

  return { type: "theme", slot, url };
}

async function updateCharacterImage(
  themeId: string,
  characterId: string,
  slot: CharacterArtworkSlot,
  url: string
) {
  const theme = await db.query.themes.findFirst({
    where: eq(themes.id, themeId),
  });

  if (!theme) throw new Error("Theme not found");

  const characters = (theme.characters || []) as ThemeCharacter[];
  const charIndex = characters.findIndex(c => c.id === characterId);

  if (charIndex === -1) throw new Error("Character not found");

  characters[charIndex] = {
    ...characters[charIndex],
    [slot]: url,
  };

  await db.update(themes)
    .set({ characters })
    .where(eq(themes.id, themeId));

  return { type: "character", characterId, slot, url };
}

async function updateCampaignArtwork(campaignId: string, slot: CampaignArtworkSlot, url: string) {
  const campaign = await db.query.campaigns.findFirst({
    where: eq(campaigns.id, campaignId),
  });

  if (!campaign) throw new Error("Campaign not found");

  const currentArtwork = (campaign.artwork || {}) as CampaignArtwork;
  const updatedArtwork: CampaignArtwork = {
    ...currentArtwork,
    [slot]: url,
  };

  await db.update(campaigns)
    .set({ artwork: updatedArtwork })
    .where(eq(campaigns.id, campaignId));

  return { type: "campaign", slot, url };
}

async function updateMissionArtwork(missionId: string, slot: MissionArtworkSlot, url: string) {
  const mission = await db.query.missions.findFirst({
    where: eq(missions.id, missionId),
  });

  if (!mission) throw new Error("Mission not found");

  const currentArtwork = (mission.artwork || {}) as MissionArtwork;
  const updatedArtwork: MissionArtwork = {
    ...currentArtwork,
    [slot]: url,
  };

  await db.update(missions)
    .set({ artwork: updatedArtwork })
    .where(eq(missions.id, missionId));

  return { type: "mission", slot, url };
}

// POST /api/admin/artwork - Upload artwork and update database
export async function POST(request: NextRequest) {
  try {
    const blobToken = process.env.SWG_READ_WRITE_TOKEN;
    if (!blobToken) {
      return NextResponse.json(
        { error: "Blob storage not configured" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const targetType = formData.get("targetType") as string | null;
    const slot = formData.get("slot") as string | null;

    // Validate file
    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    if (!ALLOWED_CONTENT_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed: PNG, JPEG, WebP` },
        { status: 400 }
      );
    }

    if (!targetType || !slot) {
      return NextResponse.json(
        { error: "targetType and slot are required" },
        { status: 400 }
      );
    }

    // Build target based on type
    let target: ArtworkTarget;

    switch (targetType) {
      case "theme": {
        const themeId = formData.get("themeId") as string;
        if (!themeId) {
          return NextResponse.json({ error: "themeId is required" }, { status: 400 });
        }
        if (!["logo", "background", "mapBackground"].includes(slot)) {
          return NextResponse.json({ error: "Invalid slot for theme" }, { status: 400 });
        }
        target = { type: "theme", themeId, slot: slot as ThemeArtworkSlot };
        break;
      }

      case "character": {
        const themeId = formData.get("themeId") as string;
        const characterId = formData.get("characterId") as string;
        if (!themeId || !characterId) {
          return NextResponse.json(
            { error: "themeId and characterId are required" },
            { status: 400 }
          );
        }
        if (!["imageUrl", "thumbnailUrl"].includes(slot)) {
          return NextResponse.json({ error: "Invalid slot for character" }, { status: 400 });
        }
        target = { type: "character", themeId, characterId, slot: slot as CharacterArtworkSlot };
        break;
      }

      case "campaign": {
        const campaignId = formData.get("campaignId") as string;
        if (!campaignId) {
          return NextResponse.json({ error: "campaignId is required" }, { status: 400 });
        }
        if (!["background", "introImage"].includes(slot)) {
          return NextResponse.json({ error: "Invalid slot for campaign" }, { status: 400 });
        }
        target = { type: "campaign", campaignId, slot: slot as CampaignArtworkSlot };
        break;
      }

      case "mission": {
        const missionId = formData.get("missionId") as string;
        if (!missionId) {
          return NextResponse.json({ error: "missionId is required" }, { status: 400 });
        }
        if (!["introImage", "outroImage"].includes(slot)) {
          return NextResponse.json({ error: "Invalid slot for mission" }, { status: 400 });
        }
        target = { type: "mission", missionId, slot: slot as MissionArtworkSlot };
        break;
      }

      default:
        return NextResponse.json({ error: "Invalid targetType" }, { status: 400 });
    }

    // Generate filename and upload
    const extension = getExtension(file.type);
    const blobPath = generateFilename(target, extension);
    const buffer = Buffer.from(await file.arrayBuffer());

    const blob = await put(blobPath, buffer, {
      access: "public",
      token: blobToken,
      contentType: file.type,
      addRandomSuffix: false,
    });

    // Update database based on target type
    let result;
    switch (target.type) {
      case "theme":
        result = await updateThemeAsset(target.themeId, target.slot, blob.url);
        break;
      case "character":
        result = await updateCharacterImage(target.themeId, target.characterId, target.slot, blob.url);
        break;
      case "campaign":
        result = await updateCampaignArtwork(target.campaignId, target.slot, blob.url);
        break;
      case "mission":
        result = await updateMissionArtwork(target.missionId, target.slot, blob.url);
        break;
    }

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Error uploading artwork:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

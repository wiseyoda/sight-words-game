import { NextRequest, NextResponse } from "next/server";
import { list, del } from "@vercel/blob";
import { db } from "@/lib/db";
import { words, themes, campaigns, missions } from "@/lib/db/schema";
import { isNotNull } from "drizzle-orm";
import type { ThemeAssets, ThemeCharacter, CampaignArtwork, MissionArtwork } from "@/lib/db/schema";

export const runtime = "nodejs";

interface OrphanedBlob {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: Date;
  type: "audio" | "emoji" | "artwork" | "unknown";
}

// Helper to add URL to set if it exists and is a valid blob URL
function addIfBlobUrl(set: Set<string>, url: string | undefined | null) {
  if (url && typeof url === "string" && url.includes("blob.vercel-storage.com")) {
    set.add(url);
  }
}

// GET /api/admin/cleanup-blobs - List orphaned blobs
export async function GET() {
  try {
    const blobToken = process.env.SWG_READ_WRITE_TOKEN;
    if (!blobToken) {
      return NextResponse.json(
        { error: "Blob storage not configured" },
        { status: 500 }
      );
    }

    // Get all blobs from storage
    const allBlobs: Array<{
      url: string;
      pathname: string;
      size: number;
      uploadedAt: Date;
    }> = [];

    let cursor: string | undefined;
    do {
      const listResult = await list({
        token: blobToken,
        cursor,
        limit: 1000,
      });
      allBlobs.push(...listResult.blobs);
      cursor = listResult.cursor;
    } while (cursor);

    // Get all referenced URLs from the database
    const referencedUrls = new Set<string>();

    // Word audio URLs
    const wordsWithAudio = await db
      .select({ audioUrl: words.audioUrl })
      .from(words)
      .where(isNotNull(words.audioUrl));
    wordsWithAudio.forEach((w) => {
      addIfBlobUrl(referencedUrls, w.audioUrl);
    });

    // Word image URLs (emojis)
    const wordsWithImages = await db
      .select({ imageUrl: words.imageUrl })
      .from(words)
      .where(isNotNull(words.imageUrl));
    wordsWithImages.forEach((w) => {
      addIfBlobUrl(referencedUrls, w.imageUrl);
    });

    // Theme assets, characters, and feedback audio
    const allThemes = await db.select({
      feedbackAudioUrls: themes.feedbackAudioUrls,
      assets: themes.assets,
      characters: themes.characters,
    }).from(themes);

    allThemes.forEach((t) => {
      // Feedback audio URLs
      if (t.feedbackAudioUrls && typeof t.feedbackAudioUrls === "object") {
        const audioUrls = t.feedbackAudioUrls as { correct?: string[]; encourage?: string[]; celebrate?: string[] };
        audioUrls.correct?.forEach((url) => addIfBlobUrl(referencedUrls, url));
        audioUrls.encourage?.forEach((url) => addIfBlobUrl(referencedUrls, url));
        audioUrls.celebrate?.forEach((url) => addIfBlobUrl(referencedUrls, url));
      }

      // Theme asset URLs (logo, background, mapBackground, sfxPack, musicTrack)
      if (t.assets && typeof t.assets === "object") {
        const assets = t.assets as ThemeAssets;
        addIfBlobUrl(referencedUrls, assets.logo);
        addIfBlobUrl(referencedUrls, assets.background);
        addIfBlobUrl(referencedUrls, assets.mapBackground);
        addIfBlobUrl(referencedUrls, assets.sfxPack);
        addIfBlobUrl(referencedUrls, assets.musicTrack);
      }

      // Theme character image URLs
      if (t.characters && Array.isArray(t.characters)) {
        (t.characters as ThemeCharacter[]).forEach((char) => {
          addIfBlobUrl(referencedUrls, char.imageUrl);
          addIfBlobUrl(referencedUrls, char.thumbnailUrl);
        });
      }
    });

    // Campaign artwork URLs
    const allCampaigns = await db.select({ artwork: campaigns.artwork }).from(campaigns);
    allCampaigns.forEach((c) => {
      if (c.artwork && typeof c.artwork === "object") {
        const artwork = c.artwork as CampaignArtwork;
        addIfBlobUrl(referencedUrls, artwork.background);
        addIfBlobUrl(referencedUrls, artwork.introImage);
      }
    });

    // Mission artwork URLs
    const allMissions = await db.select({ artwork: missions.artwork }).from(missions);
    allMissions.forEach((m) => {
      if (m.artwork && typeof m.artwork === "object") {
        const artwork = m.artwork as MissionArtwork;
        addIfBlobUrl(referencedUrls, artwork.introImage);
        addIfBlobUrl(referencedUrls, artwork.outroImage);
      }
    });

    // Find orphaned blobs (in storage but not referenced)
    const orphanedBlobs: OrphanedBlob[] = allBlobs
      .filter((blob) => !referencedUrls.has(blob.url))
      .map((blob) => ({
        url: blob.url,
        pathname: blob.pathname,
        size: blob.size,
        uploadedAt: blob.uploadedAt,
        type: blob.pathname.startsWith("audio/")
          ? "audio"
          : blob.pathname.startsWith("emoji/")
            ? "emoji"
            : blob.pathname.startsWith("artwork/") || blob.pathname.startsWith("theme/") || blob.pathname.startsWith("character/")
              ? "artwork"
              : "unknown",
      }));

    // Calculate stats
    const totalBlobs = allBlobs.length;
    const referencedCount = totalBlobs - orphanedBlobs.length;
    const orphanedSize = orphanedBlobs.reduce((sum, b) => sum + b.size, 0);

    return NextResponse.json({
      totalBlobs,
      referencedCount,
      orphanedCount: orphanedBlobs.length,
      orphanedSize,
      orphanedBlobs: orphanedBlobs.slice(0, 100), // Limit to first 100 for display
      hasMore: orphanedBlobs.length > 100,
    });
  } catch (error) {
    console.error("Error listing blobs:", error);
    return NextResponse.json(
      { error: "Failed to list blobs" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/cleanup-blobs - Delete orphaned blobs
export async function DELETE(request: NextRequest) {
  try {
    const blobToken = process.env.SWG_READ_WRITE_TOKEN;
    if (!blobToken) {
      return NextResponse.json(
        { error: "Blob storage not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { urls, deleteAll } = body as { urls?: string[]; deleteAll?: boolean };

    if (!urls && !deleteAll) {
      return NextResponse.json(
        { error: "Either urls array or deleteAll flag is required" },
        { status: 400 }
      );
    }

    let urlsToDelete: string[] = [];

    if (deleteAll) {
      // Re-fetch orphaned blobs to ensure we're deleting the right ones
      const allBlobs: Array<{ url: string; pathname: string }> = [];
      let cursor: string | undefined;
      do {
        const listResult = await list({
          token: blobToken,
          cursor,
          limit: 1000,
        });
        allBlobs.push(...listResult.blobs);
        cursor = listResult.cursor;
      } while (cursor);

      // Get all referenced URLs (same logic as GET)
      const referencedUrls = new Set<string>();

      // Word audio URLs
      const wordsWithAudio = await db
        .select({ audioUrl: words.audioUrl })
        .from(words)
        .where(isNotNull(words.audioUrl));
      wordsWithAudio.forEach((w) => {
        addIfBlobUrl(referencedUrls, w.audioUrl);
      });

      // Word image URLs
      const wordsWithImages = await db
        .select({ imageUrl: words.imageUrl })
        .from(words)
        .where(isNotNull(words.imageUrl));
      wordsWithImages.forEach((w) => {
        addIfBlobUrl(referencedUrls, w.imageUrl);
      });

      // Theme assets, characters, and feedback audio
      const allThemes = await db.select({
        feedbackAudioUrls: themes.feedbackAudioUrls,
        assets: themes.assets,
        characters: themes.characters,
      }).from(themes);

      allThemes.forEach((t) => {
        // Feedback audio URLs
        if (t.feedbackAudioUrls && typeof t.feedbackAudioUrls === "object") {
          const audioUrls = t.feedbackAudioUrls as { correct?: string[]; encourage?: string[]; celebrate?: string[] };
          audioUrls.correct?.forEach((url) => addIfBlobUrl(referencedUrls, url));
          audioUrls.encourage?.forEach((url) => addIfBlobUrl(referencedUrls, url));
          audioUrls.celebrate?.forEach((url) => addIfBlobUrl(referencedUrls, url));
        }

        // Theme asset URLs
        if (t.assets && typeof t.assets === "object") {
          const assets = t.assets as ThemeAssets;
          addIfBlobUrl(referencedUrls, assets.logo);
          addIfBlobUrl(referencedUrls, assets.background);
          addIfBlobUrl(referencedUrls, assets.mapBackground);
          addIfBlobUrl(referencedUrls, assets.sfxPack);
          addIfBlobUrl(referencedUrls, assets.musicTrack);
        }

        // Theme character image URLs
        if (t.characters && Array.isArray(t.characters)) {
          (t.characters as ThemeCharacter[]).forEach((char) => {
            addIfBlobUrl(referencedUrls, char.imageUrl);
            addIfBlobUrl(referencedUrls, char.thumbnailUrl);
          });
        }
      });

      // Campaign artwork URLs
      const allCampaigns = await db.select({ artwork: campaigns.artwork }).from(campaigns);
      allCampaigns.forEach((c) => {
        if (c.artwork && typeof c.artwork === "object") {
          const artwork = c.artwork as CampaignArtwork;
          addIfBlobUrl(referencedUrls, artwork.background);
          addIfBlobUrl(referencedUrls, artwork.introImage);
        }
      });

      // Mission artwork URLs
      const allMissions = await db.select({ artwork: missions.artwork }).from(missions);
      allMissions.forEach((m) => {
        if (m.artwork && typeof m.artwork === "object") {
          const artwork = m.artwork as MissionArtwork;
          addIfBlobUrl(referencedUrls, artwork.introImage);
          addIfBlobUrl(referencedUrls, artwork.outroImage);
        }
      });

      urlsToDelete = allBlobs
        .filter((blob) => !referencedUrls.has(blob.url))
        .map((blob) => blob.url);
    } else if (urls) {
      urlsToDelete = urls;
    }

    if (urlsToDelete.length === 0) {
      return NextResponse.json({
        deleted: 0,
        message: "No orphaned blobs to delete",
      });
    }

    // Delete in batches of 100
    let deletedCount = 0;
    const batchSize = 100;
    for (let i = 0; i < urlsToDelete.length; i += batchSize) {
      const batch = urlsToDelete.slice(i, i + batchSize);
      await del(batch, { token: blobToken });
      deletedCount += batch.length;
    }

    return NextResponse.json({
      deleted: deletedCount,
      message: `Successfully deleted ${deletedCount} orphaned blob(s)`,
    });
  } catch (error) {
    console.error("Error deleting blobs:", error);
    return NextResponse.json(
      { error: "Failed to delete blobs" },
      { status: 500 }
    );
  }
}

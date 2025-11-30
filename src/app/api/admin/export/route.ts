import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  players,
  words,
  sentences,
  themes,
  campaigns,
  missions,
  missionProgress,
  wordMastery,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ExportFormat = "json" | "csv";
type ExportType = "all" | "words" | "progress" | "player";

function toCSV(data: Record<string, unknown>[], columns: string[]): string {
  const header = columns.join(",");
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const value = row[col];
        if (value === null || value === undefined) return "";
        const str = String(value);
        // Escape quotes and wrap in quotes if contains comma or newline
        if (str.includes(",") || str.includes("\n") || str.includes('"')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      })
      .join(",")
  );
  return [header, ...rows].join("\n");
}

// GET /api/admin/export?format=json&type=all
// GET /api/admin/export?format=csv&type=words
// GET /api/admin/export?format=json&type=progress&playerId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = (searchParams.get("format") || "json") as ExportFormat;
    const type = (searchParams.get("type") || "all") as ExportType;
    const playerId = searchParams.get("playerId");

    if (!["json", "csv"].includes(format)) {
      return NextResponse.json({ error: "Invalid format" }, { status: 400 });
    }

    if (!["all", "words", "progress", "player"].includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    // Export all data as JSON
    if (type === "all" && format === "json") {
      const [
        allPlayers,
        allWords,
        allSentences,
        allThemes,
        allCampaigns,
        allMissions,
        allProgress,
        allMastery,
      ] = await Promise.all([
        db.select().from(players),
        db.select().from(words),
        db.select().from(sentences),
        db.select().from(themes),
        db.select().from(campaigns),
        db.select().from(missions),
        db.select().from(missionProgress),
        db.select().from(wordMastery),
      ]);

      const exportData = {
        exportDate: new Date().toISOString(),
        version: "1.0",
        data: {
          players: allPlayers,
          words: allWords,
          sentences: allSentences,
          themes: allThemes,
          campaigns: allCampaigns,
          missions: allMissions,
          missionProgress: allProgress,
          wordMastery: allMastery,
        },
      };

      return new NextResponse(JSON.stringify(exportData, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="sight-words-export-${Date.now()}.json"`,
        },
      });
    }

    // Export words
    if (type === "words") {
      const allWords = await db.select().from(words);

      if (format === "csv") {
        const csv = toCSV(
          allWords as unknown as Record<string, unknown>[],
          ["id", "text", "level", "audioUrl", "createdAt"]
        );
        return new NextResponse(csv, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="words-${Date.now()}.csv"`,
          },
        });
      }

      return new NextResponse(JSON.stringify({ words: allWords }, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="words-${Date.now()}.json"`,
        },
      });
    }

    // Export player progress
    if (type === "progress" || type === "player") {
      if (!playerId) {
        return NextResponse.json(
          { error: "playerId is required for progress export" },
          { status: 400 }
        );
      }

      const [player, progress, mastery] = await Promise.all([
        db.query.players.findFirst({ where: eq(players.id, playerId) }),
        db
          .select()
          .from(missionProgress)
          .where(eq(missionProgress.playerId, playerId)),
        db.select().from(wordMastery).where(eq(wordMastery.playerId, playerId)),
      ]);

      if (!player) {
        return NextResponse.json({ error: "Player not found" }, { status: 404 });
      }

      // Get word texts for mastery data
      const allWords = await db.select().from(words);
      const wordMap = new Map(allWords.map((w) => [w.id, w.text]));

      const enrichedMastery = mastery.map((m) => ({
        ...m,
        wordText: wordMap.get(m.wordId) || "unknown",
      }));

      if (format === "csv") {
        // Export word mastery as CSV
        const csv = toCSV(
          enrichedMastery as unknown as Record<string, unknown>[],
          [
            "wordText",
            "masteryLevel",
            "timesSeen",
            "timesCorrectFirstTry",
            "timesNeededRetry",
            "timesNeededHint",
            "streakCurrent",
            "streakBest",
            "lastSeenAt",
          ]
        );
        return new NextResponse(csv, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="${player.name}-progress-${Date.now()}.csv"`,
          },
        });
      }

      const exportData = {
        exportDate: new Date().toISOString(),
        player: {
          id: player.id,
          name: player.name,
          totalStars: player.totalStars,
          totalPlayTimeSeconds: player.totalPlayTimeSeconds,
          createdAt: player.createdAt,
        },
        statistics: {
          totalMissionsCompleted: progress.length,
          totalStarsEarned: progress.reduce((sum, p) => sum + (p.stars || 0), 0),
          wordsTracked: mastery.length,
          wordsMastered: mastery.filter((m) => m.masteryLevel === "mastered").length,
        },
        missionProgress: progress,
        wordMastery: enrichedMastery,
      };

      return new NextResponse(JSON.stringify(exportData, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="${player.name}-progress-${Date.now()}.json"`,
        },
      });
    }

    return NextResponse.json({ error: "Invalid export request" }, { status: 400 });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}

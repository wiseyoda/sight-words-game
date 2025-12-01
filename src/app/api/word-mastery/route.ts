import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { wordMastery, words } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface WordPerformance {
  word: string; // The word text
  correctFirstTry: boolean; // No hints and no retries
  neededHint: boolean; // Hints were used
  neededRetry: boolean; // Player failed and retried
}

/**
 * POST /api/word-mastery
 * Track word mastery when sentences are completed
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { playerId, words: wordPerformances } = body as {
      playerId: string;
      words: WordPerformance[];
    };

    // Validate playerId
    if (!playerId || !UUID_REGEX.test(playerId)) {
      return NextResponse.json(
        { error: "Valid playerId is required" },
        { status: 400 }
      );
    }

    // Validate words array
    if (!Array.isArray(wordPerformances) || wordPerformances.length === 0) {
      return NextResponse.json(
        { error: "Words array is required" },
        { status: 400 }
      );
    }

    // Get all unique word texts (lowercase for matching)
    const wordTexts = Array.from(new Set(wordPerformances.map((w) => w.word.toLowerCase())));

    // Look up word IDs from the words table
    const existingWords = await db
      .select({ id: words.id, text: words.text })
      .from(words)
      .where(inArray(words.text, wordTexts));

    const wordTextToId = new Map<string, string>();
    existingWords.forEach((w) => {
      wordTextToId.set(w.text.toLowerCase(), w.id);
    });

    // Get existing mastery records for this player and these words
    const wordIds = Array.from(wordTextToId.values());
    if (wordIds.length === 0) {
      // No words found in database - skip silently
      return NextResponse.json({ success: true, updated: 0 });
    }

    const existingMastery = await db
      .select()
      .from(wordMastery)
      .where(
        and(
          eq(wordMastery.playerId, playerId),
          inArray(wordMastery.wordId, wordIds)
        )
      );

    const masteryMap = new Map<string, typeof existingMastery[0]>();
    existingMastery.forEach((m) => {
      masteryMap.set(m.wordId, m);
    });

    // Aggregate performance by word (in case the same word appears multiple times)
    const aggregatedPerformance = new Map<string, {
      correctFirstTry: number;
      neededHint: number;
      neededRetry: number;
      total: number;
    }>();

    wordPerformances.forEach((wp) => {
      const wordId = wordTextToId.get(wp.word.toLowerCase());
      if (!wordId) return;

      const existing = aggregatedPerformance.get(wordId) || {
        correctFirstTry: 0,
        neededHint: 0,
        neededRetry: 0,
        total: 0,
      };

      existing.total++;
      if (wp.correctFirstTry) existing.correctFirstTry++;
      if (wp.neededHint) existing.neededHint++;
      if (wp.neededRetry) existing.neededRetry++;

      aggregatedPerformance.set(wordId, existing);
    });

    // Update or insert mastery records
    const updates: Promise<unknown>[] = [];

    for (const [wordId, perf] of Array.from(aggregatedPerformance.entries())) {
      const existing = masteryMap.get(wordId);

      if (existing) {
        // Update existing record
        const newTimesSeen = (existing.timesSeen ?? 0) + perf.total;
        const newTimesCorrectFirstTry = (existing.timesCorrectFirstTry ?? 0) + perf.correctFirstTry;
        const newTimesNeededHint = (existing.timesNeededHint ?? 0) + perf.neededHint;
        const newTimesNeededRetry = (existing.timesNeededRetry ?? 0) + perf.neededRetry;

        // Update streak - if all instances were correct first try, extend streak
        let newStreakCurrent = existing.streakCurrent ?? 0;
        if (perf.correctFirstTry === perf.total) {
          newStreakCurrent += perf.total;
        } else {
          newStreakCurrent = 0;
        }
        const newStreakBest = Math.max(existing.streakBest ?? 0, newStreakCurrent);

        // Calculate mastery level
        const accuracy = newTimesSeen > 0 ? (newTimesCorrectFirstTry / newTimesSeen) * 100 : 0;
        let masteryLevel = "new";
        if (accuracy >= 90 && newStreakCurrent >= 3 && newTimesSeen >= 5) {
          masteryLevel = "mastered";
        } else if (accuracy >= 70 && newTimesSeen >= 3) {
          masteryLevel = "familiar";
        } else if (newTimesSeen >= 1) {
          masteryLevel = "learning";
        }

        updates.push(
          db
            .update(wordMastery)
            .set({
              timesSeen: newTimesSeen,
              timesCorrectFirstTry: newTimesCorrectFirstTry,
              timesNeededHint: newTimesNeededHint,
              timesNeededRetry: newTimesNeededRetry,
              streakCurrent: newStreakCurrent,
              streakBest: newStreakBest,
              masteryLevel,
              lastSeenAt: new Date(),
            })
            .where(eq(wordMastery.id, existing.id))
        );
      } else {
        // Insert new record
        const masteryLevel = perf.correctFirstTry === perf.total ? "learning" : "new";

        updates.push(
          db.insert(wordMastery).values({
            playerId,
            wordId,
            timesSeen: perf.total,
            timesCorrectFirstTry: perf.correctFirstTry,
            timesNeededHint: perf.neededHint,
            timesNeededRetry: perf.neededRetry,
            streakCurrent: perf.correctFirstTry === perf.total ? perf.total : 0,
            streakBest: perf.correctFirstTry === perf.total ? perf.total : 0,
            masteryLevel,
            lastSeenAt: new Date(),
          })
        );
      }
    }

    await Promise.all(updates);

    return NextResponse.json({
      success: true,
      updated: aggregatedPerformance.size,
    });
  } catch (error) {
    console.error("Error updating word mastery:", error);
    return NextResponse.json(
      { error: "Failed to update word mastery" },
      { status: 500 }
    );
  }
}

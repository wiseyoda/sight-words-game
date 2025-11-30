import { db } from "@/lib/db";
import {
  players,
  missionProgress,
  wordMastery,
  words,
  missions,
  campaigns,
  themes,
} from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { ProgressPage } from "@/components/admin/ProgressPage";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ player?: string }>;
}

export default async function AdminProgressPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const selectedPlayerId = params.player;

  // Fetch all players for the selector
  const allPlayers = await db
    .select()
    .from(players)
    .orderBy(desc(players.updatedAt));

  // If no player selected and we have players, use the first one
  const playerId = selectedPlayerId || allPlayers[0]?.id;

  if (!playerId) {
    return (
      <ProgressPage
        players={allPlayers}
        selectedPlayer={null}
        progress={[]}
        wordMasteryData={[]}
        missions={[]}
      />
    );
  }

  // Fetch selected player's data
  const [selectedPlayer, playerProgress, playerMastery, allMissions, allWords] =
    await Promise.all([
      db.query.players.findFirst({
        where: eq(players.id, playerId),
      }),
      db
        .select()
        .from(missionProgress)
        .where(eq(missionProgress.playerId, playerId))
        .orderBy(desc(missionProgress.completedAt)),
      db
        .select()
        .from(wordMastery)
        .where(eq(wordMastery.playerId, playerId)),
      db.select().from(missions),
      db.select().from(words),
    ]);

  return (
    <ProgressPage
      players={allPlayers}
      selectedPlayer={selectedPlayer || null}
      progress={playerProgress}
      wordMasteryData={playerMastery}
      missions={allMissions}
      words={allWords}
    />
  );
}

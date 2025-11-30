import { db } from "@/lib/db";
import { players, missionProgress, themes } from "@/lib/db/schema";
import { eq, desc, count } from "drizzle-orm";
import { PlayersPage } from "@/components/admin/PlayersPage";

export const dynamic = "force-dynamic";

export default async function AdminPlayersPage() {
  const [allPlayers, allThemes, progressCounts] = await Promise.all([
    db.select().from(players).orderBy(desc(players.updatedAt)),
    db.select().from(themes).where(eq(themes.isActive, true)),
    db
      .select({
        playerId: missionProgress.playerId,
        totalStars: count(missionProgress.id),
      })
      .from(missionProgress)
      .groupBy(missionProgress.playerId),
  ]);

  // Create a map of player progress
  const progressMap = new Map(
    progressCounts.map((p) => [p.playerId, p.totalStars])
  );

  const playersWithProgress = allPlayers.map((player) => ({
    ...player,
    completedMissions: progressMap.get(player.id) || 0,
  }));

  return (
    <PlayersPage players={playersWithProgress} themes={allThemes} />
  );
}

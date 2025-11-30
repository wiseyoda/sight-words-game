import { db } from "@/lib/db";
import { players, missionProgress, wordMastery, words, missions, themes, campaigns } from "@/lib/db/schema";
import { eq, desc, sql, count } from "drizzle-orm";
import { DashboardHome } from "@/components/admin/DashboardHome";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // Fetch all data needed for dashboard
  const [
    allPlayers,
    allMissions,
    allWords,
    allThemes,
    allCampaigns,
    recentProgress,
    totalProgressRows,
    totalMasteryRows,
  ] = await Promise.all([
    db.select().from(players).orderBy(desc(players.updatedAt)),
    db.select().from(missions),
    db.select().from(words),
    db.select().from(themes).where(eq(themes.isActive, true)),
    db.select().from(campaigns).where(eq(campaigns.isActive, true)),
    db.select().from(missionProgress).orderBy(desc(missionProgress.completedAt)).limit(10),
    db.select({ count: count() }).from(missionProgress),
    db.select({ count: count() }).from(wordMastery),
  ]);

  // Calculate stats
  const stats = {
    totalPlayers: allPlayers.length,
    totalWords: allWords.length,
    totalMissions: allMissions.length,
    totalThemes: allThemes.length,
    totalCampaigns: allCampaigns.length,
    totalCompletedMissions: totalProgressRows[0]?.count || 0,
    totalWordMasteryRecords: totalMasteryRows[0]?.count || 0,
  };

  return (
    <DashboardHome
      players={allPlayers}
      stats={stats}
      recentProgress={recentProgress}
      themes={allThemes}
    />
  );
}

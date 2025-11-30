import { db } from "@/lib/db";
import { players, campaigns } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import MapClient from "./MapClient";

// For now, use a demo player - in production, this would come from auth
const DEMO_PLAYER_NAME = "Demo Player";

async function getPlayerProgress() {
  // Find demo player
  const player = await db.query.players.findFirst({
    where: eq(players.name, DEMO_PLAYER_NAME),
    with: {
      currentTheme: true,
      currentCampaign: true,
      currentMission: true,
    },
  });

  if (!player) {
    return null;
  }

  return {
    playerId: player.id,
    themeId: player.currentThemeId,
    campaignId: player.currentCampaignId,
    currentMissionId: player.currentMissionId,
  };
}

export default async function MapPage() {
  const playerData = await getPlayerProgress();

  if (!playerData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">No Player Found</h1>
          <p className="text-gray-600 mb-4">Please run the seed script first:</p>
          <code className="bg-gray-200 px-4 py-2 rounded">npm run db:seed-paw-patrol</code>
        </div>
      </div>
    );
  }

  return (
    <MapClient
      playerId={playerData.playerId}
      initialThemeId={playerData.themeId || undefined}
      campaignId={playerData.campaignId || undefined}
      currentMissionId={playerData.currentMissionId || undefined}
    />
  );
}

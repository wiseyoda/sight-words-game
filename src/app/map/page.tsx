import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { players } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import MapClient from "./MapClient";
import Link from "next/link";

const PLAYER_COOKIE_NAME = "currentPlayerId";

function isValidUUID(id: string | undefined): boolean {
  if (typeof id !== "string") return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

async function getPlayerProgress() {
  const cookieStore = await cookies();
  let playerId = cookieStore.get(PLAYER_COOKIE_NAME)?.value;

  let player = null;

  // Try to find the player from the cookie
  if (playerId && isValidUUID(playerId)) {
    player = await db.query.players.findFirst({
      where: eq(players.id, playerId),
      with: {
        currentTheme: true,
        currentCampaign: true,
        currentMission: true,
      },
    });
  }

  // If no player from cookie, try the most recently active player
  if (!player) {
    player = await db.query.players.findFirst({
      orderBy: [desc(players.updatedAt)],
      with: {
        currentTheme: true,
        currentCampaign: true,
        currentMission: true,
      },
    });
  }

  if (!player) {
    return null;
  }

  return {
    playerId: player.id,
    playerName: player.name,
    themeId: player.currentThemeId,
    campaignId: player.currentCampaignId,
    currentMissionId: player.currentMissionId,
  };
}

export default async function MapPage() {
  const playerData = await getPlayerProgress();

  if (!playerData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-md">
          <div className="text-6xl mb-4">👋</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Welcome!</h1>
          <p className="text-gray-600 mb-6">
            Create a player to start your sight words adventure.
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
          >
            Get Started
          </Link>
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

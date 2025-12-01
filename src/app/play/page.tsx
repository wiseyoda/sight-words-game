import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { sentences, missions, players } from "@/lib/db/schema";
import { eq, asc, desc } from "drizzle-orm";
import { PlayClient } from "./PlayClient";
import { getArtworkUrl, getFeaturedCharacter } from "@/lib/artwork";
import type { MissionArtwork, CampaignArtwork, ThemeAssets, ThemeCharacter } from "@/lib/db/schema";

const PLAYER_COOKIE_NAME = "currentPlayerId";

function isValidUUID(id: string | undefined): boolean {
  if (typeof id !== "string") return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

interface PlayPageProps {
  searchParams: Promise<{ missionId?: string }>;
}

export default async function PlayPage({ searchParams }: PlayPageProps) {
  const { missionId } = await searchParams;
  const cookieStore = await cookies();
  const playerId = cookieStore.get(PLAYER_COOKIE_NAME)?.value;

  // Get the current player from cookie or most recent
  let player = null;
  if (playerId && isValidUUID(playerId)) {
    player = await db.query.players.findFirst({
      where: eq(players.id, playerId),
    });
  }

  // Fallback to most recently active player
  if (!player) {
    player = await db.query.players.findFirst({
      orderBy: [desc(players.updatedAt)],
    });
  }

  // Get the specific mission or first available
  let mission;
  if (missionId) {
    mission = await db.query.missions.findFirst({
      where: eq(missions.id, missionId),
      with: {
        campaign: {
          with: {
            theme: true,
          },
        },
      },
    });
  } else {
    // Get first mission from any campaign
    mission = await db.query.missions.findFirst({
      orderBy: [asc(missions.order)],
      with: {
        campaign: {
          with: {
            theme: true,
          },
        },
      },
    });
  }

  if (!mission) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--theme-background)" }}
      >
        <div className="text-center">
          <h1
            className="text-2xl font-bold mb-4"
            style={{ color: "var(--theme-text)" }}
          >
            No missions found
          </h1>
          <p style={{ color: "var(--theme-text)", opacity: 0.7 }}>
            Run <code className="px-2 py-1 rounded" style={{ backgroundColor: "var(--theme-card-bg)" }}>npm run db:seed-paw-patrol</code> to add Paw Patrol missions.
          </p>
        </div>
      </div>
    );
  }

  // Get sentences for this mission
  const missionSentences = await db.query.sentences.findMany({
    where: eq(sentences.missionId, mission.id),
    orderBy: [asc(sentences.order)],
  });

  if (missionSentences.length === 0) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--theme-background)" }}
      >
        <div className="text-center">
          <h1
            className="text-2xl font-bold mb-4"
            style={{ color: "var(--theme-text)" }}
          >
            No sentences found
          </h1>
          <p style={{ color: "var(--theme-text)", opacity: 0.7 }}>
            No sentences in mission &quot;{mission.title}&quot;
          </p>
        </div>
      </div>
    );
  }

  // Get theme and campaign data
  const theme = mission.campaign?.theme;
  const campaign = mission.campaign;

  // Build artwork params for fallback resolution
  const artworkParams = {
    mission: { artwork: mission.artwork as MissionArtwork | null },
    campaign: campaign ? { artwork: campaign.artwork as CampaignArtwork | null } : null,
    theme: theme ? {
      assets: theme.assets as ThemeAssets | null,
      characters: theme.characters as ThemeCharacter[] | null,
    } : null,
  };

  // Get resolved artwork URLs using fallback hierarchy
  const introImage = getArtworkUrl(artworkParams, "intro");
  const outroImage = getArtworkUrl(artworkParams, "outro");
  const backgroundImage = getArtworkUrl(artworkParams, "background");
  const featuredCharacter = getFeaturedCharacter(artworkParams);

  return (
    <PlayClient
      playerId={player?.id}
      mission={{
        id: mission.id,
        title: mission.title,
        narrativeIntro: mission.narrativeIntro,
        narrativeOutro: mission.narrativeOutro,
        type: mission.type,
        campaignId: mission.campaignId,
      }}
      sentences={missionSentences.map((s) => ({
        id: s.id,
        text: s.text,
        orderedWords: s.orderedWords as string[],
        distractors: (s.distractors as string[]) || [],
      }))}
      theme={theme ? {
        id: theme.id,
        name: theme.name,
        displayName: theme.displayName,
        characters: theme.characters,
        feedbackPhrases: theme.feedbackPhrases,
      } : undefined}
      artwork={{
        introImage,
        outroImage,
        backgroundImage,
        featuredCharacter,
      }}
    />
  );
}

import { db } from "@/lib/db";
import { sentences, missions, players } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { PlayClient } from "./PlayClient";

// Demo player name - in production this would come from auth
const DEMO_PLAYER_NAME = "Demo Player";

interface PlayPageProps {
  searchParams: Promise<{ missionId?: string }>;
}

export default async function PlayPage({ searchParams }: PlayPageProps) {
  const { missionId } = await searchParams;

  // Get the demo player
  const player = await db.query.players.findFirst({
    where: eq(players.name, DEMO_PLAYER_NAME),
  });

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
            Run <code className="px-2 py-1 rounded" style={{ backgroundColor: "var(--theme-card-bg)" }}>pnpm db:seed-paw-patrol</code> to add Paw Patrol missions.
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

  // Get theme data
  const theme = mission.campaign?.theme;

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
    />
  );
}

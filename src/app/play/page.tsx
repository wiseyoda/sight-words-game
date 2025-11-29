import { db } from "@/lib/db";
import { sentences, missions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { PlayClient } from "./PlayClient";

export default async function PlayPage() {
  // Get the first mission and its sentences
  const mission = await db.query.missions.findFirst({
    orderBy: (missions, { asc }) => [asc(missions.order)],
  });

  if (!mission) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            No missions found
          </h1>
          <p className="text-gray-600">Run `pnpm db:seed` to add test data.</p>
        </div>
      </div>
    );
  }

  // Get sentences for this mission
  const missionSentences = await db.query.sentences.findMany({
    where: eq(sentences.missionId, mission.id),
    orderBy: (sentences, { asc }) => [asc(sentences.order)],
  });

  if (missionSentences.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            No sentences found
          </h1>
          <p className="text-gray-600">
            No sentences in mission &quot;{mission.title}&quot;
          </p>
        </div>
      </div>
    );
  }

  return (
    <PlayClient
      mission={{
        id: mission.id,
        title: mission.title,
        narrativeIntro: mission.narrativeIntro,
      }}
      sentences={missionSentences.map((s) => ({
        id: s.id,
        text: s.text,
        orderedWords: s.orderedWords as string[],
        distractors: (s.distractors as string[]) || [],
      }))}
    />
  );
}

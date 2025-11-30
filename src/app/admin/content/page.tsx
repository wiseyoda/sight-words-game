import { db } from "@/lib/db";
import { words, sentences, themes, campaigns, missions, type Theme } from "@/lib/db/schema";
import { asc, desc, isNotNull } from "drizzle-orm";
import { ContentPage } from "@/components/admin/ContentPage";

export const dynamic = "force-dynamic";

// Compute which adventures (themes) a word appears in based on sentence usage
async function computeWordAdventures(): Promise<Map<string, Theme[]>> {
  // Fetch all sentences with their mission -> campaign -> theme chain
  const allSentencesWithMissions = await db.query.sentences.findMany({
    where: isNotNull(sentences.missionId),
    with: {
      mission: {
        with: {
          campaign: {
            with: {
              theme: true,
            },
          },
        },
      },
    },
  });

  // Build a map of word text (lowercase) -> Set of theme IDs
  const wordToThemeIds = new Map<string, Set<string>>();
  const themeMap = new Map<string, Theme>();

  for (const sentence of allSentencesWithMissions) {
    const theme = sentence.mission?.campaign?.theme;
    if (!theme) continue;

    themeMap.set(theme.id, theme);

    // Check orderedWords
    const orderedWords = sentence.orderedWords || [];
    for (const wordText of orderedWords) {
      const key = wordText.toLowerCase();
      if (!wordToThemeIds.has(key)) {
        wordToThemeIds.set(key, new Set());
      }
      wordToThemeIds.get(key)!.add(theme.id);
    }

    // Check distractors
    const distractors = sentence.distractors || [];
    for (const wordText of distractors) {
      const key = wordText.toLowerCase();
      if (!wordToThemeIds.has(key)) {
        wordToThemeIds.set(key, new Set());
      }
      wordToThemeIds.get(key)!.add(theme.id);
    }
  }

  // Convert to Theme[] arrays
  const wordToThemes = new Map<string, Theme[]>();
  wordToThemeIds.forEach((themeIds, wordText) => {
    const themesArray = Array.from(themeIds)
      .map((id) => themeMap.get(id))
      .filter((t): t is Theme => t !== undefined);
    wordToThemes.set(wordText, themesArray);
  });

  return wordToThemes;
}

export default async function AdminContentPage() {
  const [allWords, allSentencesRaw, allThemes, allCampaigns, wordAdventures] = await Promise.all([
    db.select().from(words).orderBy(asc(words.text)),
    // Fetch sentences with their mission -> campaign -> theme chain
    db.query.sentences.findMany({
      orderBy: [desc(sentences.createdAt)],
      with: {
        mission: {
          with: {
            campaign: {
              with: {
                theme: true,
              },
            },
          },
        },
      },
    }),
    db.select().from(themes).orderBy(asc(themes.name)),
    db.query.campaigns.findMany({
      with: {
        theme: true,
        missions: {
          with: {
            sentences: true,
          },
        },
      },
      orderBy: [asc(campaigns.title)],
    }),
    computeWordAdventures(),
  ]);

  // Transform words to include computed adventures
  const wordsWithAdventures = allWords.map((word) => ({
    ...word,
    adventures: wordAdventures.get(word.text.toLowerCase()) || [],
  }));

  // Transform sentences to include computed adventure
  const sentencesWithAdventures = allSentencesRaw.map((sentence) => {
    const theme = sentence.mission?.campaign?.theme;
    return {
      ...sentence,
      mission: undefined, // Don't expose the full mission chain
      adventure: theme || null,
    };
  });

  return (
    <ContentPage
      words={wordsWithAdventures}
      sentences={sentencesWithAdventures}
      themes={allThemes}
      campaigns={allCampaigns}
    />
  );
}

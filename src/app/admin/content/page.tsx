import { db } from "@/lib/db";
import { words, sentences, themes, campaigns, missions } from "@/lib/db/schema";
import { asc, desc, eq } from "drizzle-orm";
import { ContentPage } from "@/components/admin/ContentPage";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const [allWords, allSentences, allThemes, allCampaigns] = await Promise.all([
    db.select().from(words).orderBy(asc(words.text)),
    db.select().from(sentences).orderBy(desc(sentences.createdAt)),
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
  ]);

  return (
    <ContentPage
      words={allWords}
      sentences={allSentences}
      themes={allThemes}
      campaigns={allCampaigns}
    />
  );
}

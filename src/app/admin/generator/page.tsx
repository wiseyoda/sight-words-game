import { db } from "@/lib/db";
import { themes, words, campaigns } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";
import { GeneratorPage } from "@/components/admin/GeneratorPage";

export const dynamic = "force-dynamic";

export default async function AdminGeneratorPage() {
  const [allThemes, allWords, allCampaigns] = await Promise.all([
    db.select().from(themes).where(eq(themes.isActive, true)).orderBy(asc(themes.name)),
    db.select().from(words).orderBy(asc(words.text)),
    db.select().from(campaigns).orderBy(asc(campaigns.title)),
  ]);

  return (
    <GeneratorPage
      themes={allThemes}
      existingWords={allWords.map((w) => w.text)}
      campaigns={allCampaigns}
    />
  );
}

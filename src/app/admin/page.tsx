import { db, words, sentences } from "@/lib/db";
import { asc, desc } from "drizzle-orm";
import AdminClient from "./AdminClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  // Fetch all words and sentences
  const [allWords, allSentences] = await Promise.all([
    db.select().from(words).orderBy(asc(words.text)),
    db.select().from(sentences).orderBy(desc(sentences.createdAt)),
  ]);

  return (
    <AdminClient
      initialWords={allWords}
      initialSentences={allSentences}
    />
  );
}

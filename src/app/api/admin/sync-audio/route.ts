import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { words } from "@/lib/db/schema";
import { list } from "@vercel/blob";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

const BLOB_TOKEN = process.env.SWG_READ_WRITE_TOKEN;

interface SyncResult {
  totalBlobFiles: number;
  alreadyInDb: number;
  newlyAdded: number;
  errors: string[];
  addedWords: string[];
}

export async function GET(): Promise<NextResponse> {
  try {
    if (!BLOB_TOKEN) {
      return NextResponse.json(
        { error: "Blob storage is not configured" },
        { status: 500 }
      );
    }

    // List all audio files in the blob storage
    const { blobs } = await list({
      prefix: "audio/words/",
      token: BLOB_TOKEN,
    });

    // Get all words from database
    const existingWords = await db.select().from(words);
    const existingAudioUrls = new Set(existingWords.map(w => w.audioUrl).filter(Boolean));
    const existingWordTexts = new Map(existingWords.map(w => [w.text.toLowerCase(), w]));

    const result: SyncResult = {
      totalBlobFiles: blobs.length,
      alreadyInDb: 0,
      newlyAdded: 0,
      errors: [],
      addedWords: [],
    };

    for (const blob of blobs) {
      // Check if this URL is already in the database
      if (existingAudioUrls.has(blob.url)) {
        result.alreadyInDb++;
        continue;
      }

      // Extract word from filename (e.g., "audio/words/hello.mp3" -> "hello")
      const filename = blob.pathname.split("/").pop() || "";
      const wordText = filename.replace(/\.mp3$/i, "");

      if (!wordText) {
        result.errors.push(`Could not extract word from: ${blob.pathname}`);
        continue;
      }

      // Check if word already exists in DB by text (might have different audio URL)
      const existingWord = existingWordTexts.get(wordText.toLowerCase());

      if (existingWord) {
        // Update existing word with the blob URL if it doesn't have one
        if (!existingWord.audioUrl) {
          await db
            .update(words)
            .set({ audioUrl: blob.url })
            .where(eq(words.id, existingWord.id));
          result.addedWords.push(`${wordText} (updated)`);
          result.newlyAdded++;
        } else {
          result.alreadyInDb++;
        }
      } else {
        // Create new word record
        try {
          await db.insert(words).values({
            text: wordText,
            audioUrl: blob.url,
            level: "generated",
          });
          result.addedWords.push(wordText);
          result.newlyAdded++;
        } catch (insertError) {
          result.errors.push(`Failed to insert "${wordText}": ${insertError}`);
        }
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Audio sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync audio files" },
      { status: 500 }
    );
  }
}

// POST endpoint to trigger sync and return summary
export async function POST(): Promise<NextResponse> {
  return GET();
}

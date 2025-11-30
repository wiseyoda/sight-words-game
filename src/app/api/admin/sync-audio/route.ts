import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { words } from "@/lib/db/schema";
import { list } from "@vercel/blob";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

interface SyncResult {
  blobCount: number;
  alreadyInDb: number;
  newlyAdded: number;
  errors: string[];
  addedWords: string[];
  debug?: {
    tokenConfigured: boolean;
    prefix: string;
  };
}

export async function GET(): Promise<NextResponse> {
  try {
    // Get token at request time (not module load time)
    const blobToken = process.env.SWG_READ_WRITE_TOKEN;

    if (!blobToken) {
      return NextResponse.json(
        { error: "Blob storage is not configured (SWG_READ_WRITE_TOKEN missing)" },
        { status: 500 }
      );
    }

    // List all audio files in the blob storage (handle pagination)
    const allBlobs: { url: string; pathname: string }[] = [];
    let cursor: string | undefined;

    do {
      const response = await list({
        prefix: "audio/words/",
        token: blobToken,
        cursor,
        limit: 1000,
      });
      allBlobs.push(...response.blobs);
      cursor = response.cursor;
    } while (cursor);

    // Get all words from database
    const existingWords = await db.select().from(words);
    const existingAudioUrls = new Set(existingWords.map(w => w.audioUrl).filter(Boolean));
    const existingWordTexts = new Map(existingWords.map(w => [w.text.toLowerCase(), w]));

    const result: SyncResult = {
      blobCount: allBlobs.length,
      alreadyInDb: 0,
      newlyAdded: 0,
      errors: [],
      addedWords: [],
      debug: {
        tokenConfigured: !!blobToken,
        prefix: "audio/words/",
      },
    };

    for (const blob of allBlobs) {
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
            type: "generated",
            isSightWord: false,
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

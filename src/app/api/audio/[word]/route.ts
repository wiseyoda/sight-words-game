import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { words } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import OpenAI from "openai";
import { put } from "@vercel/blob";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const BLOB_TOKEN = process.env.SWG_READ_WRITE_TOKEN;

// TTS configuration
const TTS_CONFIG = {
  model: "tts-1" as const,
  voice: "nova" as const,
  speed: 0.9,
};

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: { word: string } }
): Promise<NextResponse> {
  const { word } = params;
  const wordText = decodeURIComponent(word);

  try {
    if (!process.env.OPENAI_API_KEY || !BLOB_TOKEN) {
      return NextResponse.json(
        { error: "Audio service is not configured" },
        { status: 500 }
      );
    }

    // Look up word in database (case-insensitive)
    const wordRecord = await db.query.words.findFirst({
      where: sql`LOWER(${words.text}) = LOWER(${wordText})`,
    });

    // If word exists and has audio, fetch and return it (don't redirect - Howler doesn't like redirects)
    if (wordRecord?.audioUrl) {
      try {
        const audioResponse = await fetch(wordRecord.audioUrl);
        if (audioResponse.ok) {
          const audioBuffer = await audioResponse.arrayBuffer();
          return new NextResponse(audioBuffer, {
            headers: {
              "Content-Type": "audio/mpeg",
              "Cache-Control": "public, max-age=31536000, immutable",
            },
          });
        }
      } catch (fetchError) {
        console.error(`Failed to fetch cached audio for "${wordText}":`, fetchError);
        // Fall through to generate new audio
      }
    }

    // Generate audio on-demand if not cached
    console.log(`Generating audio on-demand for "${wordText}"`);

    const response = await openai.audio.speech.create({
      model: TTS_CONFIG.model,
      voice: TTS_CONFIG.voice,
      input: wordText,
      speed: TTS_CONFIG.speed,
    });

    const buffer = Buffer.from(await response.arrayBuffer());

    // Upload to Vercel Blob
    const filename = `audio/words/${wordText.toLowerCase().replace(/[^a-z]/g, "") || "word"}.mp3`;
    const blob = await put(filename, buffer, {
      access: "public",
      token: BLOB_TOKEN,
      contentType: "audio/mpeg",
    });

    // Update database if word exists
    if (wordRecord) {
      await db
        .update(words)
        .set({ audioUrl: blob.url })
        .where(eq(words.id, wordRecord.id));
    }

    // Return the audio directly
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error(`Audio generation error for "${wordText}":`, error);
    return NextResponse.json(
      { error: "Failed to generate audio" },
      { status: 500 }
    );
  }
}

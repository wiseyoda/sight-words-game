import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { words } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import OpenAI from "openai";
import { put } from "@vercel/blob";

/**
 * GET /api/audio/[word]
 *
 * Generates TTS audio for individual words.
 * Uses OpenAI's gpt-4o-mini-tts model with instructions for clear,
 * child-appropriate pronunciation.
 */

const MAX_WORD_LENGTH = 50;
const WORD_PATTERN = /^[a-zA-Z'\-\s]+$/;

// TTS configuration using the latest gpt-4o-mini-tts model
const TTS_CONFIG = {
  model: "gpt-4o-mini-tts" as const,
  voice: "coral" as const, // Warm, friendly voice good for children
};

// Instructions for clear word pronunciation
const TTS_INSTRUCTIONS = `You are teaching a young child (ages 4-6) to read.
- Pronounce the word clearly and distinctly
- Speak at a slightly slower pace for learning
- Use a warm and encouraging tone
- This is a sight word the child is learning to recognize`;

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: { word: string } }
): Promise<NextResponse> {
  const { word } = params;
  const wordText = decodeURIComponent(word).trim();

  if (!wordText || wordText.length > MAX_WORD_LENGTH || !WORD_PATTERN.test(wordText)) {
    return NextResponse.json(
      { error: "Invalid word" },
      { status: 400 }
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const blobToken = process.env.SWG_READ_WRITE_TOKEN;

  try {
    if (!apiKey || !blobToken) {
      console.error("Audio service not configured:", { hasApiKey: !!apiKey, hasBlobToken: !!blobToken });
      return NextResponse.json(
        { error: "Audio service is not configured" },
        { status: 500 }
      );
    }

    // Look up word in database (case-insensitive)
    let wordRecord;
    try {
      wordRecord = await db.query.words.findFirst({
        where: sql`LOWER(${words.text}) = LOWER(${wordText})`,
      });
    } catch (dbError) {
      console.error(`Database lookup error for "${wordText}":`, dbError);
      return NextResponse.json(
        { error: "Database connection failed - please try again" },
        { status: 503 }
      );
    }

    // If word exists and has audio, fetch and return it (proxy to avoid CORS issues)
    if (wordRecord?.audioUrl) {
      try {
        // Add cache-busting query to force fresh fetch from blob storage
        const audioUrl = new URL(wordRecord.audioUrl);
        audioUrl.searchParams.set("v", "2"); // Version 2 = gpt-4o-mini-tts with coral voice

        const audioResponse = await fetch(audioUrl.toString());
        if (audioResponse.ok) {
          const audioBuffer = await audioResponse.arrayBuffer();
          return new NextResponse(audioBuffer, {
            headers: {
              "Content-Type": "audio/mpeg",
              // Use shorter cache to allow updates; ETag for revalidation
              "Cache-Control": "public, max-age=86400, stale-while-revalidate=86400",
              "ETag": `"v2-${wordText.toLowerCase()}"`,
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

    const openai = new OpenAI({ apiKey });

    // Generate TTS audio
    let response;
    let buffer: Buffer;
    try {
      response = await openai.audio.speech.create({
        model: TTS_CONFIG.model,
        voice: TTS_CONFIG.voice,
        input: wordText,
        instructions: TTS_INSTRUCTIONS,
      });
      buffer = Buffer.from(await response.arrayBuffer());
    } catch (openaiError) {
      console.error(`OpenAI TTS error for "${wordText}":`, openaiError);
      return NextResponse.json(
        { error: "Text-to-speech service failed - please try again" },
        { status: 503 }
      );
    }

    // Upload to Vercel Blob
    let blob;
    try {
      const filename = `audio/words/${wordText.toLowerCase().replace(/[^a-z]/g, "") || "word"}.mp3`;
      blob = await put(filename, buffer, {
        access: "public",
        token: blobToken,
        contentType: "audio/mpeg",
      });
    } catch (blobError) {
      console.error(`Blob storage error for "${wordText}":`, blobError);
      // Still return the audio even if caching fails
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "no-store",
        },
      });
    }

    // Update database if word exists, otherwise create new word record
    try {
      if (wordRecord) {
        await db
          .update(words)
          .set({ audioUrl: blob.url })
          .where(eq(words.id, wordRecord.id));
      } else {
        // Create new word record for on-demand generated audio
        // Type "generated" marks words created via on-demand TTS (not core sight words)
        await db.insert(words).values({
          text: wordText,
          audioUrl: blob.url,
          type: "generated",
          isSightWord: false,
        });
        console.log(`Created new word record for on-demand audio: "${wordText}"`);
      }
    } catch (dbUpdateError) {
      console.error(`Database update error for "${wordText}":`, dbUpdateError);
      // Still return the audio even if database update fails
    }

    // Return the audio directly
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "audio/mpeg",
        // Use shorter cache to allow updates; ETag for revalidation
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=86400",
        "ETag": `"v2-${wordText.toLowerCase()}"`,
      },
    });
  } catch (error) {
    console.error(`Unexpected audio generation error for "${wordText}":`, error);
    return NextResponse.json(
      { error: "Failed to generate audio - unexpected error" },
      { status: 500 }
    );
  }
}

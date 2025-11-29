import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// TTS configuration for sentences
const TTS_CONFIG = {
  model: "tts-1" as const,
  voice: "nova" as const,
  speed: 0.85, // Slightly slower for sentence comprehension
};

export const runtime = "nodejs";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Audio service is not configured" },
        { status: 500 }
      );
    }

    const { sentence } = await request.json();

    if (!sentence || typeof sentence !== "string") {
      return NextResponse.json(
        { error: "Sentence is required" },
        { status: 400 }
      );
    }

    // Generate audio for the sentence
    const response = await openai.audio.speech.create({
      model: TTS_CONFIG.model,
      voice: TTS_CONFIG.voice,
      input: sentence,
      speed: TTS_CONFIG.speed,
    });

    const buffer = Buffer.from(await response.arrayBuffer());

    // Return the audio directly (not cached - sentences are dynamic)
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Sentence audio generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate sentence audio" },
      { status: 500 }
    );
  }
}

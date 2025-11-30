import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

/**
 * POST /api/audio/celebrate
 *
 * Generates combined TTS audio for a sentence + feedback phrase.
 * This avoids overlapping audio by combining everything into one call.
 *
 * Body: { sentence: string, feedbackPhrase?: string }
 */

export const runtime = "nodejs";

// TTS configuration
const TTS_CONFIG = {
  model: "tts-1" as const,
  voice: "nova" as const,
  speed: 0.95,
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { sentence, feedbackPhrase } = body;

    if (!sentence || typeof sentence !== "string") {
      return NextResponse.json(
        { error: "Sentence is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Audio service is not configured" },
        { status: 500 }
      );
    }

    // Combine sentence and feedback phrase with a pause
    // Use ... for a natural pause between sentence and celebration
    let text = sentence.trim();
    if (feedbackPhrase) {
      text = `${text} ... ${feedbackPhrase}`;
    }

    const openai = new OpenAI({ apiKey });

    const response = await openai.audio.speech.create({
      model: TTS_CONFIG.model,
      voice: TTS_CONFIG.voice,
      input: text,
      speed: TTS_CONFIG.speed,
    });

    const buffer = Buffer.from(await response.arrayBuffer());

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store", // Don't cache combined audio
      },
    });
  } catch (error) {
    console.error("Celebrate audio error:", error);
    return NextResponse.json(
      { error: "Failed to generate audio" },
      { status: 500 }
    );
  }
}

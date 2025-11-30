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

// Input limits for security/cost control
const MAX_SENTENCE_LENGTH = 200; // Max characters for sentence
const MAX_FEEDBACK_LENGTH = 100; // Max characters for feedback phrase
const MAX_TOTAL_LENGTH = 250; // Max combined text length

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { sentence, feedbackPhrase } = body;

    // Validate sentence
    if (!sentence || typeof sentence !== "string") {
      return NextResponse.json(
        { error: "Sentence is required" },
        { status: 400 }
      );
    }

    // Enforce input length limits
    if (sentence.length > MAX_SENTENCE_LENGTH) {
      return NextResponse.json(
        { error: `Sentence exceeds maximum length of ${MAX_SENTENCE_LENGTH} characters` },
        { status: 400 }
      );
    }

    if (feedbackPhrase && typeof feedbackPhrase === "string" && feedbackPhrase.length > MAX_FEEDBACK_LENGTH) {
      return NextResponse.json(
        { error: `Feedback phrase exceeds maximum length of ${MAX_FEEDBACK_LENGTH} characters` },
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
    if (feedbackPhrase && typeof feedbackPhrase === "string") {
      text = `${text} ... ${feedbackPhrase.trim()}`;
    }

    // Final length check for combined text
    if (text.length > MAX_TOTAL_LENGTH) {
      return NextResponse.json(
        { error: `Combined text exceeds maximum length of ${MAX_TOTAL_LENGTH} characters` },
        { status: 400 }
      );
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

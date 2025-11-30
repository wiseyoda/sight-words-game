import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

/**
 * POST /api/audio/sentence
 *
 * Generates TTS audio for a sentence preview.
 * Uses OpenAI's gpt-4o-mini-tts model with instructions for clear,
 * child-appropriate pronunciation.
 *
 * Body: { sentence: string }
 */

// TTS configuration using the latest gpt-4o-mini-tts model
const TTS_CONFIG = {
  model: "gpt-4o-mini-tts" as const,
  voice: "coral" as const, // Warm, friendly voice good for children
};

// Instructions for clear pronunciation aimed at early readers
const TTS_INSTRUCTIONS = `You are reading a sentence to a young child (ages 4-6) who is learning to read.
- Speak clearly at a slightly slower pace for comprehension
- Pronounce each word distinctly with proper enunciation
- Use a warm and friendly tone
- Maintain natural rhythm and intonation`;

export const runtime = "nodejs";

const MAX_SENTENCE_LENGTH = 300;

/**
 * Format sentence for optimal TTS pronunciation
 */
function formatSentenceForTTS(sentence: string): string {
  let text = sentence.trim();

  // Ensure sentence ends with punctuation for natural cadence
  if (!/[.!?]$/.test(text)) {
    text += ".";
  }

  // Capitalize first letter
  text = text.charAt(0).toUpperCase() + text.slice(1);

  return text;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
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

    if (sentence.length > MAX_SENTENCE_LENGTH) {
      return NextResponse.json(
        { error: "Sentence is too long" },
        { status: 400 }
      );
    }

    const openai = new OpenAI({ apiKey });

    // Format sentence with proper punctuation
    const formattedSentence = formatSentenceForTTS(sentence);

    // Generate audio for the sentence
    const response = await openai.audio.speech.create({
      model: TTS_CONFIG.model,
      voice: TTS_CONFIG.voice,
      input: formattedSentence,
      instructions: TTS_INSTRUCTIONS,
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

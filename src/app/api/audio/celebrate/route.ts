import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

/**
 * POST /api/audio/celebrate
 *
 * Generates combined TTS audio for a sentence + feedback phrase.
 * Uses OpenAI's gpt-4o-mini-tts model with instructions for child-friendly,
 * encouraging tone.
 *
 * Body: { sentence: string, feedbackPhrase?: string }
 */

export const runtime = "nodejs";

// TTS configuration using the latest gpt-4o-mini-tts model
// This model supports the 'instructions' parameter for tone control
const TTS_CONFIG = {
  model: "gpt-4o-mini-tts" as const,
  voice: "coral" as const, // Warm, friendly voice good for children
};

// Instructions for child-friendly, encouraging speech
const TTS_INSTRUCTIONS = `You are reading to a young child (ages 4-6) who is learning to read.
- Speak clearly and at a slightly slower pace for comprehension
- Use a warm, encouraging, and cheerful tone
- Add natural enthusiasm when reading the encouragement phrase
- Pronounce each word distinctly
- Sound genuinely happy and proud when giving praise`;

// Input limits for security/cost control
const MAX_SENTENCE_LENGTH = 200; // Max characters for sentence
const MAX_FEEDBACK_LENGTH = 100; // Max characters for feedback phrase
const MAX_TOTAL_LENGTH = 350; // Max combined text length (increased for proper formatting)

/**
 * Format text for optimal TTS pronunciation
 * - Ensures proper punctuation
 * - Adds natural pauses
 */
function formatTextForTTS(sentence: string, feedbackPhrase?: string): string {
  let text = sentence.trim();

  // Ensure sentence ends with punctuation for natural cadence
  if (!/[.!?]$/.test(text)) {
    text += ".";
  }

  // Capitalize first letter
  text = text.charAt(0).toUpperCase() + text.slice(1);

  if (feedbackPhrase && typeof feedbackPhrase === "string") {
    let feedback = feedbackPhrase.trim();

    // Ensure feedback has proper punctuation
    if (!/[.!?]$/.test(feedback)) {
      feedback += "!";
    }

    // Use ellipsis for a natural pause between sentence and celebration
    text = `${text} ... ${feedback}`;
  }

  return text;
}

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

    // Format text with proper punctuation and pauses
    const text = formatTextForTTS(sentence, feedbackPhrase);

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
      instructions: TTS_INSTRUCTIONS,
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

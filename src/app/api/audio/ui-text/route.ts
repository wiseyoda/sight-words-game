import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

/**
 * POST /api/audio/ui-text
 *
 * Generates TTS audio for UI announcements and guidance text.
 * Uses OpenAI's gpt-4o-mini-tts model with instructions optimized
 * for child-friendly announcements.
 *
 * Body: { text: string, style?: 'celebrate' | 'encourage' | 'guide' }
 */

// TTS configuration using the latest gpt-4o-mini-tts model
const TTS_CONFIG = {
  model: "gpt-4o-mini-tts" as const,
  voice: "coral" as const, // Warm, friendly voice good for children
};

// Instructions for different announcement styles
const TTS_INSTRUCTIONS = {
  celebrate: `You are celebrating with a young child (ages 4-6) who just accomplished something.
- Sound genuinely excited and proud
- Speak with enthusiasm and joy
- Use a warm, encouraging tone
- Slightly emphasize key celebratory words`,

  encourage: `You are encouraging a young child (ages 4-6) to start a fun activity.
- Sound warm, friendly, and inviting
- Speak at a slightly slower pace for comprehension
- Use an upbeat, positive tone
- Make it sound like an exciting adventure`,

  guide: `You are guiding a young child (ages 4-6) through an activity.
- Speak clearly at a slightly slower pace
- Use a warm and friendly tone
- Sound helpful and supportive
- Keep the energy positive`,
};

export const runtime = "nodejs";

const MAX_TEXT_LENGTH = 500;

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Audio service is not configured" },
        { status: 500 }
      );
    }

    const { text, style = "guide" } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    if (text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json({ error: "Text is too long" }, { status: 400 });
    }

    type AudioStyle = "celebrate" | "encourage" | "guide";
    const validStyles: AudioStyle[] = ["celebrate", "encourage", "guide"];
    const selectedStyle: AudioStyle = validStyles.includes(style) ? style : "guide";

    const openai = new OpenAI({ apiKey });

    // Generate audio for the UI text
    const response = await openai.audio.speech.create({
      model: TTS_CONFIG.model,
      voice: TTS_CONFIG.voice,
      input: text,
      instructions: TTS_INSTRUCTIONS[selectedStyle],
    });

    const buffer = Buffer.from(await response.arrayBuffer());

    // Return the audio directly (not cached - UI text is dynamic)
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("UI text audio generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate UI text audio" },
      { status: 500 }
    );
  }
}

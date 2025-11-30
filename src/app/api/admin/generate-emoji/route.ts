import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

// Standard emoji settings for sight words game
const EMOJI_STYLES = {
  flat: "flat vector icon, simple shapes, minimal details, soft colors, white background, isolated, emoji style, centered",
  "3d": "3d render, claymation style, glossy, cute, soft lighting, white background, isolated, emoji style, centered",
  pixel: "pixel art, 8-bit, retro game style, white background, isolated, emoji style, centered",
  line: "black and white line art, thick outlines, minimal, sticker style, white background, isolated, centered",
} as const;

type EmojiStyle = keyof typeof EMOJI_STYLES;

// POST /api/admin/generate-emoji
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, style = "flat" } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    if (prompt.length > 200) {
      return NextResponse.json(
        { error: "Prompt is too long (max 200 characters)" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.error("GOOGLE_API_KEY not configured - get one from https://aistudio.google.com/app/apikey");
      return NextResponse.json(
        { error: "GOOGLE_API_KEY not configured. Get an API key from https://aistudio.google.com and add it to your .env file." },
        { status: 500 }
      );
    }

    // Validate style
    const validStyle = EMOJI_STYLES[style as EmojiStyle] ? style : "flat";
    const stylePrompt = EMOJI_STYLES[validStyle as EmojiStyle];

    // Build the final prompt - wrap user input with style instructions
    const finalPrompt = `A ${stylePrompt} of a ${prompt.trim()}`;

    console.log(`Generating emoji: "${finalPrompt}"`);

    // Use Google GenAI SDK with Imagen 4.0
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateImages({
      model: "imagen-4.0-generate-001",
      prompt: finalPrompt,
      config: {
        numberOfImages: 1,
      },
    });

    const generatedImage = response.generatedImages?.[0];
    if (!generatedImage?.image?.imageBytes) {
      console.error("No image data in response:", response);
      return NextResponse.json(
        { error: "No image data received from API" },
        { status: 500 }
      );
    }

    const base64Image = generatedImage.image.imageBytes;

    // Return the base64 image data
    return NextResponse.json({
      success: true,
      imageData: `data:image/png;base64,${base64Image}`,
      prompt: finalPrompt,
    });
  } catch (error) {
    console.error("Error generating emoji:", error);

    // Extract error message if available
    let errorMessage = "Failed to generate emoji";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

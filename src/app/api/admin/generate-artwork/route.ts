import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

// Artwork type configurations with style presets
const ARTWORK_TYPES = {
  // Theme assets
  logo: {
    description: "Theme logo",
    sizes: { width: 256, height: 256 },
    styles: {
      cartoon: "cartoon logo, vibrant colors, bold outlines, game logo style, professional, centered, white background",
      modern: "modern minimal logo, clean lines, professional, centered, white background",
      playful: "playful children's logo, rounded shapes, bright colors, friendly, centered, white background",
    },
  },
  background: {
    description: "Game background",
    sizes: { width: 1920, height: 1080 },
    styles: {
      scenic: "scenic landscape, soft colors, dreamy atmosphere, child-friendly, game background",
      abstract: "abstract colorful pattern, soft gradients, playful shapes, game background",
      illustrated: "illustrated scene, storybook style, warm colors, inviting atmosphere, game background",
    },
  },
  mapBackground: {
    description: "Story map background",
    sizes: { width: 1920, height: 1080 },
    styles: {
      treasure: "treasure map style, parchment texture, illustrated paths, adventure theme, game map background",
      world: "illustrated world map, colorful regions, whimsical locations, children's book style, game map",
      journey: "adventure journey map, winding paths, illustrated landmarks, storybook style, game map",
    },
  },
  // Character artwork
  character: {
    description: "Character portrait",
    sizes: { width: 512, height: 512 },
    styles: {
      cartoon: "cartoon character portrait, expressive face, vibrant colors, clean lines, white background",
      "3d": "3d rendered character, pixar style, friendly expression, soft lighting, white background",
      anime: "anime style character, big expressive eyes, colorful, dynamic pose, white background",
    },
  },
  thumbnail: {
    description: "Character thumbnail",
    sizes: { width: 128, height: 128 },
    styles: {
      icon: "character icon, simple, recognizable, bold colors, circular frame style, white background",
      avatar: "avatar icon, friendly face, round style, bold colors, white background",
    },
  },
  // Campaign/Mission artwork
  scene: {
    description: "Story scene",
    sizes: { width: 1280, height: 720 },
    styles: {
      storybook: "storybook illustration, warm colors, magical atmosphere, children's book style",
      cinematic: "cinematic scene, dramatic lighting, adventure theme, game cutscene style",
      whimsical: "whimsical illustration, fantasy elements, bright colors, enchanted atmosphere",
    },
  },
} as const;

type ArtworkType = keyof typeof ARTWORK_TYPES;

// POST /api/admin/generate-artwork
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      prompt,
      artworkType = "character",
      style,
      customStyle,
      themeName, // For context in prompts
    } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    if (prompt.length > 500) {
      return NextResponse.json(
        { error: "Prompt is too long (max 500 characters)" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.error("GOOGLE_API_KEY not configured");
      return NextResponse.json(
        { error: "GOOGLE_API_KEY not configured. Get an API key from https://aistudio.google.com and add it to your .env file." },
        { status: 500 }
      );
    }

    // Get artwork type config
    const typeConfig = ARTWORK_TYPES[artworkType as ArtworkType];
    if (!typeConfig) {
      return NextResponse.json(
        { error: `Invalid artwork type. Valid types: ${Object.keys(ARTWORK_TYPES).join(", ")}` },
        { status: 400 }
      );
    }

    // Determine style prompt
    let stylePrompt: string;
    if (customStyle) {
      stylePrompt = customStyle;
    } else if (style && style in typeConfig.styles) {
      stylePrompt = typeConfig.styles[style as keyof typeof typeConfig.styles];
    } else {
      // Use first style as default
      const defaultStyle = Object.values(typeConfig.styles)[0];
      stylePrompt = defaultStyle;
    }

    // Build context-aware prompt
    let contextPrefix = "";
    if (themeName) {
      contextPrefix = `In the style of ${themeName} theme, `;
    }

    const finalPrompt = `${contextPrefix}${stylePrompt}: ${prompt.trim()}`;

    console.log(`Generating ${artworkType} artwork: "${finalPrompt}"`);

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

    // Return the base64 image data with metadata
    return NextResponse.json({
      success: true,
      imageData: `data:image/png;base64,${base64Image}`,
      prompt: finalPrompt,
      artworkType,
      recommendedSize: typeConfig.sizes,
    });
  } catch (error) {
    console.error("Error generating artwork:", error);

    let errorMessage = "Failed to generate artwork";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// GET /api/admin/generate-artwork - Return available types and styles
export async function GET() {
  const types = Object.entries(ARTWORK_TYPES).map(([key, config]) => ({
    type: key,
    description: config.description,
    sizes: config.sizes,
    styles: Object.keys(config.styles),
  }));

  return NextResponse.json({ types });
}

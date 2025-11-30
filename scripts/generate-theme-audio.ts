/**
 * Generate TTS audio for theme feedback phrases
 *
 * Usage: npx tsx scripts/generate-theme-audio.ts [theme-id]
 *
 * This script:
 * 1. Loads a theme from the database
 * 2. Generates TTS audio for all feedback phrases (correct, encourage, celebrate)
 * 3. Uploads to Vercel Blob storage
 * 4. Updates the theme with audio URLs
 */

import { db } from "../src/lib/db";
import { themes } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";
import OpenAI from "openai";
import { put } from "@vercel/blob";

// TTS configuration - use same voice as word audio for consistency
const TTS_CONFIG = {
  model: "tts-1" as const,
  voice: "nova" as const,
  speed: 0.95, // Slightly slower for excited phrases
};

interface FeedbackPhrases {
  correct: string[];
  encourage: string[];
  celebrate: string[];
}

interface FeedbackAudioUrls {
  correct: string[];
  encourage: string[];
  celebrate: string[];
}

async function generateThemeAudio(themeId?: string) {
  const openaiKey = process.env.OPENAI_API_KEY;
  const blobToken = process.env.SWG_READ_WRITE_TOKEN;

  if (!openaiKey) {
    console.error("❌ OPENAI_API_KEY not set");
    process.exit(1);
  }
  if (!blobToken) {
    console.error("❌ SWG_READ_WRITE_TOKEN not set");
    process.exit(1);
  }

  const openai = new OpenAI({ apiKey: openaiKey });

  // Get theme(s) to process
  let themesToProcess;
  if (themeId) {
    const theme = await db.query.themes.findFirst({
      where: eq(themes.id, themeId),
    });
    if (!theme) {
      console.error(`❌ Theme not found: ${themeId}`);
      process.exit(1);
    }
    themesToProcess = [theme];
  } else {
    // Process all active themes
    themesToProcess = await db.query.themes.findMany({
      where: eq(themes.isActive, true),
    });
  }

  console.log(`\n🎵 Generating audio for ${themesToProcess.length} theme(s)...\n`);

  for (const theme of themesToProcess) {
    console.log(`\n📦 Processing: ${theme.displayName}`);
    console.log("─".repeat(50));

    const feedbackPhrases = theme.feedbackPhrases as FeedbackPhrases | null;
    if (!feedbackPhrases) {
      console.log("   ⚠️  No feedback phrases defined, skipping");
      continue;
    }

    const audioUrls: FeedbackAudioUrls = {
      correct: [],
      encourage: [],
      celebrate: [],
    };

    // Process each category
    for (const category of ["correct", "encourage", "celebrate"] as const) {
      const phrases = feedbackPhrases[category] || [];
      console.log(`\n   ${category.toUpperCase()} (${phrases.length} phrases):`);

      for (let i = 0; i < phrases.length; i++) {
        const phrase = phrases[i];
        const filename = `audio/themes/${theme.name}/${category}/${String(i + 1).padStart(2, "0")}.mp3`;

        try {
          console.log(`      ${i + 1}. "${phrase}"`);

          // Generate TTS
          const response = await openai.audio.speech.create({
            model: TTS_CONFIG.model,
            voice: TTS_CONFIG.voice,
            input: phrase,
            speed: TTS_CONFIG.speed,
          });

          const buffer = Buffer.from(await response.arrayBuffer());

          // Upload to Vercel Blob
          const blob = await put(filename, buffer, {
            access: "public",
            token: blobToken,
            contentType: "audio/mpeg",
          });

          audioUrls[category].push(blob.url);
          console.log(`         ✓ Uploaded: ${blob.url.substring(0, 60)}...`);
        } catch (error) {
          console.error(`         ❌ Failed: ${error}`);
          // Add empty string as placeholder to maintain index alignment
          audioUrls[category].push("");
        }
      }
    }

    // Update theme with audio URLs
    try {
      await db
        .update(themes)
        .set({ feedbackAudioUrls: audioUrls })
        .where(eq(themes.id, theme.id));
      console.log(`\n   ✅ Updated theme with audio URLs`);
    } catch (error) {
      console.error(`\n   ❌ Failed to update theme: ${error}`);
    }
  }

  console.log("\n" + "═".repeat(50));
  console.log("🎉 Audio generation complete!");
  console.log("═".repeat(50) + "\n");
}

// Get theme ID from command line args
const themeId = process.argv[2];

generateThemeAudio(themeId)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });

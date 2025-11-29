import "dotenv/config";
import OpenAI from "openai";
import { put } from "@vercel/blob";
import { db } from "../src/lib/db";
import { words } from "../src/lib/db/schema";
import { isNull } from "drizzle-orm";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const BLOB_TOKEN = process.env.SWG_READ_WRITE_TOKEN!;

// TTS configuration based on research
const TTS_CONFIG = {
  model: "tts-1" as const,
  voice: "nova" as const, // Bright, engaging for children
  speed: 0.9, // Slightly slower for young learners
};

async function generateWordAudio(word: string): Promise<string> {
  console.log(`  Generating audio for "${word}"...`);

  // Generate audio using OpenAI TTS
  const response = await openai.audio.speech.create({
    model: TTS_CONFIG.model,
    voice: TTS_CONFIG.voice,
    input: word,
    speed: TTS_CONFIG.speed,
  });

  // Convert to buffer
  const buffer = Buffer.from(await response.arrayBuffer());

  // Upload to Vercel Blob
  const filename = `audio/words/${word.toLowerCase().replace(/[^a-z]/g, "")}.mp3`;
  const blob = await put(filename, buffer, {
    access: "public",
    token: BLOB_TOKEN,
    contentType: "audio/mpeg",
  });

  console.log(`    ✓ Uploaded to ${blob.url} (${buffer.length} bytes)`);
  return blob.url;
}

async function main() {
  console.log("🔊 Generating audio for all words...\n");

  // Get all words without audio
  const wordsToGenerate = await db
    .select()
    .from(words)
    .where(isNull(words.audioUrl));

  console.log(`Found ${wordsToGenerate.length} words needing audio\n`);

  if (wordsToGenerate.length === 0) {
    console.log("All words already have audio!");
    return;
  }

  let successCount = 0;
  let errorCount = 0;

  for (const word of wordsToGenerate) {
    try {
      const audioUrl = await generateWordAudio(word.text);

      // Update word record with audio URL
      const { eq } = await import("drizzle-orm");
      await db
        .update(words)
        .set({ audioUrl })
        .where(eq(words.id, word.id));

      successCount++;
    } catch (error) {
      console.error(`    ✗ Failed for "${word.text}":`, error);
      errorCount++;
    }

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log("\n=====================================");
  console.log(`✅ Audio generation complete!`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log("=====================================");
}

main().catch((err) => {
  console.error("❌ Audio generation failed:", err);
  process.exit(1);
});

import "dotenv/config";
import OpenAI from "openai";
import { put } from "@vercel/blob";
import { db } from "../src/lib/db";
import { words } from "../src/lib/db/schema";
import { isNull } from "drizzle-orm";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error("OPENAI_API_KEY is not set");
}

const blobToken = process.env.SWG_READ_WRITE_TOKEN;
if (!blobToken) {
  throw new Error("SWG_READ_WRITE_TOKEN is not set");
}

const openai = new OpenAI({ apiKey });

// TTS configuration using the latest gpt-4o-mini-tts model
const TTS_CONFIG = {
  model: "gpt-4o-mini-tts" as const,
  voice: "coral" as const, // Warm, friendly voice good for children
};

// Instructions for clear word pronunciation
const TTS_INSTRUCTIONS = `You are teaching a young child (ages 4-6) to read.
- Pronounce the word clearly and distinctly
- Speak at a slightly slower pace for learning
- Use a warm and encouraging tone
- This is a sight word the child is learning to recognize`;

async function generateWordAudio(word: string): Promise<string> {
  console.log(`  Generating audio for "${word}"...`);

  // Generate audio using OpenAI TTS
  const response = await openai.audio.speech.create({
    model: TTS_CONFIG.model,
    voice: TTS_CONFIG.voice,
    input: word,
    instructions: TTS_INSTRUCTIONS,
  });

  // Convert to buffer
  const buffer = Buffer.from(await response.arrayBuffer());

  // Upload to Vercel Blob (overwrite existing to regenerate with new TTS model)
  const filename = `audio/words/${word.toLowerCase().replace(/[^a-z]/g, "")}.mp3`;
  const blob = await put(filename, buffer, {
    access: "public",
    token: blobToken,
    contentType: "audio/mpeg",
    allowOverwrite: true,
  });

  console.log(`    ✓ Uploaded to ${blob.url} (${buffer.length} bytes)`);
  return blob.url;
}

async function main() {
  // Check for --force flag to regenerate all audio
  const forceRegenerate = process.argv.includes("--force");

  console.log("🔊 Generating audio for words...\n");

  // Get words to generate (all if --force, otherwise only missing)
  const wordsToGenerate = forceRegenerate
    ? await db.select().from(words)
    : await db.select().from(words).where(isNull(words.audioUrl));

  console.log(
    `Found ${wordsToGenerate.length} words ${forceRegenerate ? "(regenerating all)" : "needing audio"}\n`
  );

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

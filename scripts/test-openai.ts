import "dotenv/config";
import OpenAI from "openai";

async function main() {
  console.log("Testing OpenAI connection...\n");

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const openai = new OpenAI({ apiKey });

  // Test 1: Chat completion (for sentence validation)
  console.log("1. Testing Chat API (for sentence validation)...");
  const chatResponse = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: 'Is "The dog can run." a valid English sentence? Reply with just YES or NO.',
      },
    ],
    max_tokens: 10,
  });
  const answer = chatResponse.choices[0].message.content;
  console.log(`   ✓ Response: ${answer}\n`);

  // Test 2: TTS (for word audio)
  console.log("2. Testing TTS API (for word audio)...");
  const ttsResponse = await openai.audio.speech.create({
    model: "gpt-4o-mini-tts",
    voice: "coral",
    input: "the",
    instructions: "Pronounce this word clearly for a child learning to read.",
  });
  const audioBuffer = await ttsResponse.arrayBuffer();
  console.log(`   ✓ Generated ${audioBuffer.byteLength} bytes of audio\n`);

  console.log("=====================================");
  console.log("✅ OpenAI tests passed!");
  console.log("=====================================");
}

main().catch((err) => {
  console.error("❌ OpenAI test failed:", err.message);
  process.exit(1);
});

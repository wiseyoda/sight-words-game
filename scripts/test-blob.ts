import "dotenv/config";
import { put, del, list } from "@vercel/blob";

async function main() {
  console.log("Testing Vercel Blob connection...\n");

  const token = process.env.SWG_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error("SWG_READ_WRITE_TOKEN is not set");
  }

  // Test 1: Upload a test file
  console.log("1. Uploading test file...");
  const testContent = "Hello from Sight Words Game!";
  const blob = await put("test/hello.txt", testContent, {
    access: "public",
    token,
  });
  console.log(`   ✓ Uploaded to: ${blob.url}\n`);

  // Test 2: List blobs
  console.log("2. Listing blobs...");
  const { blobs } = await list({ token });
  console.log(`   ✓ Found ${blobs.length} blob(s)\n`);

  // Test 3: Delete test file
  console.log("3. Cleaning up test file...");
  await del(blob.url, { token });
  console.log(`   ✓ Deleted test blob\n`);

  console.log("=====================================");
  console.log("✅ Vercel Blob tests passed!");
  console.log("=====================================");
}

main().catch((err) => {
  console.error("❌ Blob test failed:", err.message);
  process.exit(1);
});

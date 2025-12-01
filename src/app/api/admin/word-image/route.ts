import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { words } from "@/lib/db/schema";
import { eq, or, ilike } from "drizzle-orm";

export const runtime = "nodejs";

/**
 * GET /api/admin/word-image?word=Bluey
 * Look up existing image/emoji for a word (useful for character artwork)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const wordText = searchParams.get("word");

    if (!wordText) {
      return NextResponse.json(
        { error: "word parameter is required" },
        { status: 400 }
      );
    }

    // Search for word (case-insensitive)
    const found = await db.query.words.findFirst({
      where: or(
        eq(words.text, wordText),
        ilike(words.text, wordText)
      ),
    });

    if (!found) {
      return NextResponse.json({
        found: false,
        word: wordText,
      });
    }

    return NextResponse.json({
      found: true,
      word: found.text,
      emoji: found.emoji,
      imageUrl: found.imageUrl,
      isCharacterWord: found.isCharacterWord,
    });
  } catch (error) {
    console.error("Error looking up word image:", error);
    return NextResponse.json(
      { error: "Failed to look up word image" },
      { status: 500 }
    );
  }
}

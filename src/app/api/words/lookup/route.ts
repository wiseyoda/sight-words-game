import { NextRequest, NextResponse } from "next/server";
import { db, words } from "@/lib/db";
import { inArray } from "drizzle-orm";
import { sql } from "drizzle-orm";

export const runtime = "nodejs";

// POST /api/words/lookup - Look up multiple words by text
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { words: wordTexts } = body;

    if (!Array.isArray(wordTexts) || wordTexts.length === 0) {
      return NextResponse.json(
        { error: "words array is required" },
        { status: 400 }
      );
    }

    // Limit to prevent abuse
    if (wordTexts.length > 100) {
      return NextResponse.json(
        { error: "Maximum 100 words per request" },
        { status: 400 }
      );
    }

    // Normalize to lowercase
    const normalizedTexts = wordTexts.map((w: string) =>
      typeof w === "string" ? w.toLowerCase().trim() : ""
    ).filter(Boolean);

    if (normalizedTexts.length === 0) {
      return NextResponse.json({ words: [] });
    }

    // Look up words by text (case-insensitive)
    const foundWords = await db
      .select()
      .from(words)
      .where(inArray(sql`LOWER(${words.text})`, normalizedTexts));

    return NextResponse.json({ words: foundWords });
  } catch (error) {
    console.error("Error looking up words:", error);
    return NextResponse.json(
      { error: "Failed to look up words" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db, words } from "@/lib/db";
import { eq, asc } from "drizzle-orm";

export const runtime = "nodejs";

// GET /api/admin/words - List all words
export async function GET() {
  try {
    const allWords = await db
      .select()
      .from(words)
      .orderBy(asc(words.text));

    return NextResponse.json({ words: allWords });
  } catch (error) {
    console.error("Error fetching words:", error);
    return NextResponse.json(
      { error: "Failed to fetch words" },
      { status: 500 }
    );
  }
}

// POST /api/admin/words - Create a new word
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, level = "custom" } = body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Word text is required" },
        { status: 400 }
      );
    }

    // Validate word length
    if (text.trim().length > 50) {
      return NextResponse.json(
        { error: "Word is too long (max 50 characters)" },
        { status: 400 }
      );
    }

    const wordText = text.trim().toLowerCase();

    // Check if word already exists
    const existing = await db
      .select()
      .from(words)
      .where(eq(words.text, wordText))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Word already exists", existing: existing[0] },
        { status: 409 }
      );
    }

    // Create the word
    const [newWord] = await db
      .insert(words)
      .values({
        text: wordText,
        level: level,
      })
      .returning();

    return NextResponse.json({ word: newWord }, { status: 201 });
  } catch (error) {
    console.error("Error creating word:", error);
    return NextResponse.json(
      { error: "Failed to create word" },
      { status: 500 }
    );
  }
}

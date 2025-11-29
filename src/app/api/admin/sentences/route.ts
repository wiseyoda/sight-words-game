import { NextRequest, NextResponse } from "next/server";
import { db, sentences, words } from "@/lib/db";
import { asc, inArray, sql } from "drizzle-orm";

export const runtime = "nodejs";

// GET /api/admin/sentences - List all sentences
export async function GET() {
  try {
    const allSentences = await db
      .select()
      .from(sentences)
      .orderBy(asc(sentences.createdAt));

    return NextResponse.json({ sentences: allSentences });
  } catch (error) {
    console.error("Error fetching sentences:", error);
    return NextResponse.json(
      { error: "Failed to fetch sentences" },
      { status: 500 }
    );
  }
}

// POST /api/admin/sentences - Create a new sentence
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, distractors = [] } = body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Sentence text is required" },
        { status: 400 }
      );
    }

    // Validate text length (prevent DoS)
    if (text.length > 500) {
      return NextResponse.json(
        { error: "Sentence text is too long (max 500 characters)" },
        { status: 400 }
      );
    }

    // Validate distractors
    if (!Array.isArray(distractors) || distractors.length > 20) {
      return NextResponse.json(
        { error: "Distractors must be an array with max 20 items" },
        { status: 400 }
      );
    }
    const validDistractors = distractors
      .filter((d): d is string => typeof d === "string" && d.trim().length > 0)
      .map(d => d.trim().toLowerCase())
      .slice(0, 20);

    const sentenceText = text.trim();

    // Parse the sentence into words (strip punctuation for word lookup)
    const orderedWords = sentenceText
      .split(/\s+/)
      .map(w => w.replace(/[.,!?;:'"()]/g, "").toLowerCase())
      .filter(w => w.length > 0);

    if (orderedWords.length === 0) {
      return NextResponse.json(
        { error: "Sentence must contain at least one word" },
        { status: 400 }
      );
    }

    // Check which words exist in the database
    const existingWords = await db
      .select({ text: words.text })
      .from(words)
      .where(inArray(sql`LOWER(${words.text})`, orderedWords));

    const existingWordTexts = new Set(existingWords.map(w => w.text.toLowerCase()));
    const missingWords = orderedWords.filter(w => !existingWordTexts.has(w));

    if (missingWords.length > 0) {
      return NextResponse.json(
        {
          error: "Some words are not in the word bank",
          missingWords: Array.from(new Set(missingWords))
        },
        { status: 400 }
      );
    }

    // Create the sentence
    const [newSentence] = await db
      .insert(sentences)
      .values({
        text: sentenceText,
        orderedWords: orderedWords,
        distractors: validDistractors,
      })
      .returning();

    return NextResponse.json({ sentence: newSentence }, { status: 201 });
  } catch (error) {
    console.error("Error creating sentence:", error);
    return NextResponse.json(
      { error: "Failed to create sentence" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

interface ValidateSentenceRequest {
  submittedWords: string[];
  availableWords?: string[];
  targetSentence?: string;
}

interface ValidateSentenceResponse {
  valid: boolean;
  reason?: string;
  encouragement: string;
}

export const runtime = "nodejs";

const MAX_SUBMITTED_WORDS = 50;
const MAX_AVAILABLE_WORDS = 120;
const MAX_SENTENCE_CHARS = 300;
const MAX_WORD_LENGTH = 40;

function sanitizeWords(words: unknown, maxItems: number) {
  if (!Array.isArray(words) || words.length === 0 || words.length > maxItems) {
    return null;
  }

  const sanitized = words
    .filter((w): w is string => typeof w === "string")
    .map((w) => w.trim())
    .filter((w) => w.length > 0 && w.length <= MAX_WORD_LENGTH);

  return sanitized.length === words.length ? sanitized : null;
}

export async function POST(request: NextRequest): Promise<NextResponse<ValidateSentenceResponse>> {
  let body: ValidateSentenceRequest;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        valid: false,
        reason: "Invalid request body",
        encouragement: "Let's try that sentence again!",
      },
      { status: 400 }
    );
  }

  const submittedWords = sanitizeWords(body.submittedWords, MAX_SUBMITTED_WORDS);
  const availableWords = body.availableWords ? sanitizeWords(body.availableWords, MAX_AVAILABLE_WORDS) : undefined;
  const targetSentence = typeof body.targetSentence === "string" ? body.targetSentence.trim() : undefined;

  if (!submittedWords) {
    return NextResponse.json({
      valid: false,
      reason: "No words submitted",
      encouragement: "Try placing some words!",
    });
  }

  if (targetSentence && targetSentence.length > MAX_SENTENCE_CHARS) {
    return NextResponse.json(
      {
        valid: false,
        reason: "Sentence is too long",
        encouragement: "Let's try a shorter sentence!",
      },
      { status: 400 }
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        valid: false,
        reason: "Validation service is not configured",
        encouragement: "Let's try again soon!",
      },
      { status: 500 }
    );
  }

  // Build the submitted sentence
  const submittedSentence = submittedWords
    .join(" ")
    .replace(" .", ".")
    .replace(" ?", "?")
    .replace(" !", "!");

  try {
    const openai = new OpenAI({ apiKey });
    // Create the validation prompt
    const prompt = `You are a kindergarten reading teacher evaluating a sentence built by a 5-year-old child.

The child submitted this sentence: "${submittedSentence}"
${targetSentence ? `The expected sentence was: "${targetSentence}"` : ""}
${availableWords ? `Available words were: ${availableWords.join(", ")}` : ""}

Evaluate if the submitted sentence is:
1. Grammatically correct (basic grammar acceptable for children's books)
2. A complete, meaningful sentence

IMPORTANT: Be flexible! Accept sentences that:
- Have slightly different word order but still make sense
- Use all the required words
- Form a valid English sentence

Respond in JSON format:
{
  "valid": true or false,
  "reason": "brief reason if invalid",
  "encouragement": "a short, encouraging message for a child"
}

If valid, use encouraging phrases like: "Great job!", "You did it!", "Awesome!", "Way to go!", "Perfect!"
If invalid, use supportive phrases like: "Almost there!", "Try again!", "You can do it!", "So close!"`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 150,
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const result = JSON.parse(content) as ValidateSentenceResponse;

    return NextResponse.json({
      valid: result.valid,
      reason: result.reason,
      encouragement: result.encouragement || (result.valid ? "Great job!" : "Try again!"),
    });
  } catch (error) {
    console.error("Validation error:", error);

    if (targetSentence && submittedWords) {
      // Simple fallback: check if words match (case-insensitive)
      const submitted = submittedWords
        .join(" ")
        .toLowerCase()
        .replace(" .", ".")
        .replace(" ?", "?")
        .replace(" !", "!");
      const target = targetSentence.toLowerCase();

      const isValid = submitted === target;

      return NextResponse.json({
        valid: isValid,
        encouragement: isValid ? "Great job!" : "Almost there! Try again!",
      });
    }

    return NextResponse.json({
      valid: false,
      reason: "Validation failed",
      encouragement: "Let's try again!",
    });
  }
}

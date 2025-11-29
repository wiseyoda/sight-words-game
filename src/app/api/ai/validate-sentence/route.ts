import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";

// =============================================================================
// Types and Schemas
// =============================================================================

interface ValidateSentenceRequest {
  submittedWords: string[];
  availableWords?: string[];
  targetSentence?: string;
}

// Zod schema for runtime validation of AI response
const ValidationResponseSchema = z.object({
  valid: z.boolean(),
  reason: z.string().optional().default(""),
  encouragement: z.string(),
});

type ValidateSentenceResponse = z.infer<typeof ValidationResponseSchema>;

// =============================================================================
// Constants
// =============================================================================

export const runtime = "nodejs";

const MAX_SUBMITTED_WORDS = 50;
const MAX_AVAILABLE_WORDS = 120;
const MAX_SENTENCE_CHARS = 300;
const MAX_WORD_LENGTH = 40;
const MAX_RETRIES = 2;

// Model configuration (can be overridden via environment variable)
const AI_MODEL = process.env.SENTENCE_VALIDATOR_MODEL || "gpt-4o-mini";
const AI_TEMPERATURE = 0.3; // Slightly creative for varied encouragement

// =============================================================================
// System Prompt - Simple and permissive (following original working version)
// =============================================================================

const SYSTEM_PROMPT = `You are a kindergarten reading teacher evaluating sentences built by 5-year-old children. Your goal is to encourage learning while being FLEXIBLE about what counts as correct.

VALIDATION APPROACH:
- Be GENEROUS and FLEXIBLE in your evaluation
- Accept sentences with different word orders if they still make grammatical sense
- Accept minor variations that a child might naturally produce
- Focus on whether it's a valid English sentence, not perfection

WHEN TO MARK VALID:
- The sentence is grammatically acceptable (children's book level)
- The sentence makes logical sense
- The words form a complete thought

WHEN TO MARK INVALID:
- The words are in a completely nonsensical order
- Critical words are missing that break the meaning
- It's not recognizable as a sentence

RESPONSE FORMAT:
Always respond with valid JSON:
{"valid": true/false, "reason": "brief reason if invalid, empty if valid", "encouragement": "short encouraging message"}

ENCOURAGEMENT STYLE:
- Valid: "Great job!", "You did it!", "Awesome!", "Perfect!", "Way to go!"
- Invalid: "Almost there!", "So close!", "Try again!", "You can do it!"`;

// =============================================================================
// Helper Functions
// =============================================================================

function sanitizeWords(words: unknown, maxItems: number): string[] | null {
  if (!Array.isArray(words) || words.length === 0 || words.length > maxItems) {
    return null;
  }

  const sanitized = words
    .filter((w): w is string => typeof w === "string")
    .map((w) => w.trim())
    .filter((w) => w.length > 0 && w.length <= MAX_WORD_LENGTH);

  return sanitized.length === words.length ? sanitized : null;
}

function buildUserPrompt(
  submittedSentence: string,
  availableWords?: string[],
  targetSentence?: string
): string {
  // Use XML-style delimiters to separate user input from instructions (security best practice)
  let prompt = `<submission>${submittedSentence}</submission>`;

  if (targetSentence) {
    prompt += `\n<expected>${targetSentence}</expected>`;
  }

  if (availableWords) {
    prompt += `\n<available_words>${availableWords.join(", ")}</available_words>`;
  }

  prompt += `\n\nEvaluate if the sentence in <submission> is valid. Be flexible with word order variations.`;

  return prompt;
}

function buildSubmittedSentence(words: string[]): string {
  return words
    .join(" ")
    .replace(" .", ".")
    .replace(" ?", "?")
    .replace(" !", "!");
}

async function callOpenAI(
  openai: OpenAI,
  userPrompt: string,
  retryCount = 0
): Promise<ValidateSentenceResponse> {
  const response = await openai.chat.completions.create({
    model: AI_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    max_tokens: 150,
    temperature: AI_TEMPERATURE,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from AI");
  }

  // Parse and validate with Zod
  const parsed = JSON.parse(content);
  const result = ValidationResponseSchema.safeParse(parsed);

  if (!result.success) {
    if (retryCount < MAX_RETRIES) {
      const retryPrompt = `${userPrompt}\n\nIMPORTANT: Respond with ONLY valid JSON: {"valid": boolean, "reason": "string", "encouragement": "string"}`;
      return callOpenAI(openai, retryPrompt, retryCount + 1);
    }
    throw new Error("Invalid AI response format after retries");
  }

  return result.data;
}

function fallbackValidation(
  submittedWords: string[],
  targetSentence: string
): ValidateSentenceResponse {
  // Simple fallback: exact match check (case-insensitive)
  const submitted = buildSubmittedSentence(submittedWords).toLowerCase();
  const target = targetSentence.toLowerCase();
  const isValid = submitted === target;

  return {
    valid: isValid,
    reason: isValid ? "" : "Please check your sentence",
    encouragement: isValid ? "Great job!" : "Almost there! Try again!",
  };
}

// =============================================================================
// API Route Handler
// =============================================================================

export async function POST(
  request: NextRequest
): Promise<NextResponse<ValidateSentenceResponse>> {
  let body: ValidateSentenceRequest;

  // Parse request body
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

  // Validate and sanitize inputs
  const submittedWords = sanitizeWords(body.submittedWords, MAX_SUBMITTED_WORDS);
  const availableWords = body.availableWords
    ? sanitizeWords(body.availableWords, MAX_AVAILABLE_WORDS)
    : undefined;
  const targetSentence =
    typeof body.targetSentence === "string"
      ? body.targetSentence.trim()
      : undefined;

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

  // Check API key
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
  const submittedSentence = buildSubmittedSentence(submittedWords);

  // Call OpenAI for validation
  try {
    const openai = new OpenAI({ apiKey });
    const userPrompt = buildUserPrompt(
      submittedSentence,
      availableWords ?? undefined,
      targetSentence
    );

    const result = await callOpenAI(openai, userPrompt);

    return NextResponse.json({
      valid: result.valid,
      reason: result.reason || "",
      encouragement:
        result.encouragement || (result.valid ? "Great job!" : "Try again!"),
    });
  } catch (error) {
    console.error("Validation error:", error);

    // Use fallback validation if we have a target sentence
    if (targetSentence && submittedWords) {
      return NextResponse.json(fallbackValidation(submittedWords, targetSentence));
    }

    return NextResponse.json({
      valid: false,
      reason: "Validation failed",
      encouragement: "Let's try again!",
    });
  }
}

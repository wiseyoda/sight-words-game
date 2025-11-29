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
  reason: z.string(),
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

// Model configuration (can be made configurable via env/db in Phase 3)
const AI_MODEL = process.env.SENTENCE_VALIDATOR_MODEL || "gpt-4o-mini";
const AI_TEMPERATURE = 0.1; // Low temperature for deterministic validation

// =============================================================================
// System Prompt (following GPT-5 best practices with XML tags)
// =============================================================================

const SYSTEM_PROMPT = `<role>
You are an educational assistant validating sentences built by a 5-year-old learning to read. Your goal is to encourage learning while providing accurate feedback.
</role>

<validation_rules>
Evaluate the child's sentence against these criteria:

1. GRAMMATICAL CORRECTNESS
   - Must be a proper English sentence structure
   - Subject-verb agreement required
   - Articles and prepositions used correctly
   - Basic grammar acceptable for children's books

2. SEMANTIC MEANING
   - Must make logical sense
   - Does not need to be profound, just coherent

3. WORD USAGE
   - Must use ONLY words from the available words list (if provided)
   - All words in submission must be present in available words
   - Punctuation should be included

4. WORD ORDER FLEXIBILITY
   - Accept grammatically valid variations
   - Examples of equivalent valid sentences:
     * "The cat and dog run." = VALID
     * "The dog and cat run." = VALID
     * "A big red ball." = VALID
     * "A red big ball." = INVALID (adjective order rule)
     * "Cat the dog and run." = INVALID (not grammatical)
</validation_rules>

<output_format>
You MUST respond with ONLY valid JSON in this exact format:
{
  "valid": boolean,
  "reason": "string (brief explanation, empty string if valid)",
  "encouragement": "string (short encouraging message for the child)"
}
</output_format>

<encouragement_guidelines>
- For VALID sentences: Celebrate with enthusiasm
  Examples: "Perfect sentence!", "You're a great reader!", "That's exactly right!", "Wonderful work!"

- For INVALID sentences: Be gentle and constructive, never discouraging
  Examples: "Almost! Try moving one word.", "So close! Check the order.", "Good try! One word needs to move."

- NEVER use negative language like "wrong", "incorrect", "bad", or "failed"
- Keep messages under 10 words
- Use exclamation marks for energy
</encouragement_guidelines>

<examples>
Example 1:
Input: Available Words: ["The", "cat", "is", "big", "."], Submission: "The cat is big."
Output: {"valid": true, "reason": "", "encouragement": "Perfect sentence!"}

Example 2:
Input: Available Words: ["The", "dog", "runs", "."], Submission: "Dog the runs."
Output: {"valid": false, "reason": "Words need to be in the right order", "encouragement": "Almost! Try moving one word."}

Example 3:
Input: Available Words: ["She", "likes", "to", "play", "."], Submission: "She likes to jump."
Output: {"valid": false, "reason": "The word 'jump' is not available", "encouragement": "Check your word choices!"}

Example 4:
Input: Available Words: ["I", "can", "run", "and", "jump", "."], Submission: "I can jump and run."
Output: {"valid": true, "reason": "", "encouragement": "Great job!"}
</examples>

<safety_constraints>
- This is for a children's educational game
- Always be encouraging and positive
- Never output anything inappropriate for a 5-year-old
- Focus on the learning experience
</safety_constraints>`;

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
  // Use XML tags to delimit user input (prevents prompt injection)
  return `<submission>
<sentence>${submittedSentence}</sentence>
${targetSentence ? `<expected>${targetSentence}</expected>` : ""}
${availableWords ? `<available_words>${availableWords.join(", ")}</available_words>` : ""}
</submission>

Evaluate the sentence within the <sentence> tags according to your validation rules.`;
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
    // Retry with explicit instruction if parsing fails
    if (retryCount < MAX_RETRIES) {
      const retryPrompt = `${userPrompt}

IMPORTANT: Your previous response was not valid JSON. Please respond with ONLY valid JSON matching this exact format:
{"valid": boolean, "reason": "string", "encouragement": "string"}`;

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

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

export async function POST(request: NextRequest): Promise<NextResponse<ValidateSentenceResponse>> {
  try {
    const body: ValidateSentenceRequest = await request.json();
    const { submittedWords, availableWords, targetSentence } = body;

    if (!submittedWords || submittedWords.length === 0) {
      return NextResponse.json({
        valid: false,
        reason: "No words submitted",
        encouragement: "Try placing some words!",
      });
    }

    // Build the submitted sentence
    const submittedSentence = submittedWords.join(" ").replace(" .", ".").replace(" ?", "?").replace(" !", "!");

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

    // Fallback to simple validation
    const body = await request.json().catch(() => ({})) as ValidateSentenceRequest;
    const { submittedWords, targetSentence } = body;

    if (targetSentence && submittedWords) {
      // Simple fallback: check if words match (case-insensitive)
      const submitted = submittedWords.join(" ").toLowerCase().replace(" .", ".").replace(" ?", "?");
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

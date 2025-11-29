# AI Integration

← [Back to Technical](./README.md)

---

## Overview

AI powers three critical features:
1. **Sentence Validation** - Check if child's answer is correct
2. **Content Generation** - Create new sentences and campaigns
3. **Audio Generation** - Text-to-speech for words

---

## Provider Configuration

### OpenAI Setup

```typescript
// /lib/ai/config.ts

import { createOpenAI } from '@ai-sdk/openai';

export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Models used
export const MODELS = {
  validation: 'gpt-4o-mini',     // Fast, cheap, accurate enough
  generation: 'gpt-4o',          // Better quality for content
  tts: 'tts-1',                  // Standard TTS
};
```

### Vercel AI SDK

```typescript
import { generateText, streamText } from 'ai';

// Non-streaming (validation)
const { text } = await generateText({
  model: openai(MODELS.validation),
  prompt: validationPrompt,
});

// Streaming (generation)
const stream = await streamText({
  model: openai(MODELS.generation),
  prompt: generationPrompt,
});
```

---

## Sentence Validation Prompt

```typescript
const VALIDATION_PROMPT = `
You are validating a sentence built by a 5-year-old learning to read.

CONTEXT: {missionContext}
AVAILABLE WORDS: {availableWords}
CHILD'S SUBMISSION: "{submittedSentence}"

Evaluate if the sentence is:
1. Grammatically correct (proper English)
2. Semantically meaningful (makes sense)
3. Uses only available words

IMPORTANT: Be flexible with word order when grammatically valid.
- "The cat and dog run" = VALID
- "The dog and cat run" = VALID
- "Cat the dog run and" = INVALID

Respond with JSON:
{
  "valid": true/false,
  "reason": "Brief explanation if invalid",
  "encouragement": "Short message for child"
}

Encouragement examples:
- Valid: "Perfect!", "Great job!", "You did it!"
- Invalid: "Almost! Try again.", "So close!", "Keep trying!"
`;
```

---

## Content Generation Prompts

### Sentence Generator

```typescript
const SENTENCE_PROMPT = `
Create educational sentences for a 5-year-old.

TOPIC: {topic}
TARGET WORDS: {wordList}
COUNT: {count}
DIFFICULTY: {level}

Generate {count} sentences that:
1. Use TARGET WORDS primarily
2. Are 3-6 words long
3. Are grammatically correct
4. Are age-appropriate

For each, provide:
- Sentence text
- Word list (ordered)
- 2 distractor words

Return JSON array.
`;
```

### Campaign Generator

```typescript
const CAMPAIGN_PROMPT = `
Create an educational game campaign for a 5-year-old.

THEME: {themeName}
STORY: {storyIdea}
WORD LEVEL: {difficulty}
MISSIONS: {count}
CHARACTERS: {characters}

Create:
1. Story synopsis (3-4 sentences)
2. Color palette (hex codes)
3. Character details
4. {count} missions with:
   - Title
   - Intro narrative (2 sentences)
   - 3-5 sentences using target words
   - Outro narrative (1 sentence)
5. Feedback phrases (themed)

Return structured JSON.
`;
```

---

## TTS Configuration

```typescript
const TTS_CONFIG = {
  model: 'tts-1',
  voice: 'nova',      // Warm, friendly
  speed: 0.9,         // Slightly slower for clarity
  format: 'mp3',
};

async function generateWordAudio(word: string): Promise<Buffer> {
  const response = await openai.audio.speech.create({
    ...TTS_CONFIG,
    input: word,
  });

  return Buffer.from(await response.arrayBuffer());
}
```

---

## Error Handling

### Retry Logic

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(1000 * Math.pow(2, i)); // Exponential backoff
    }
  }
  throw new Error('Max retries exceeded');
}
```

### Fallback Behavior

| Failure | Fallback |
|---------|----------|
| Validation fails | Check against known answers |
| Generation fails | Show manual creation UI |
| TTS fails | Display word without audio |

---

## Rate Limiting

### OpenAI Limits

- Monitor usage in dashboard
- Implement request queuing
- Cache repeated queries

### Cost Management

| Operation | Model | Cost (approx) |
|-----------|-------|---------------|
| Validation | gpt-4o-mini | $0.0001/call |
| Generation | gpt-4o | $0.01/campaign |
| TTS | tts-1 | $0.015/1K chars |

---

← [Technical](./README.md) | [Performance →](./performance.md)

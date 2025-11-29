# API Routes

← [Back to Technical](./README.md)

---

## Route Overview

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/ai/validate-sentence` | POST | LLM sentence validation |
| `/api/ai/generate-sentences` | POST | Generate new sentences |
| `/api/ai/generate-audio` | POST | Generate TTS audio |
| `/api/ai/generate-campaign` | POST | Generate full campaign |
| `/api/audio/[wordId]` | GET | Serve/generate word audio |
| `/api/progress` | GET/POST | Player progress CRUD |

---

## Sentence Validation (Critical)

### POST `/api/ai/validate-sentence`

**Purpose**: Validate child's sentence submission using LLM

**Request**:
```typescript
{
  submittedWords: string[];      // ["The", "dog", "can", "run", "."]
  availableWords: string[];      // All words in word bank
  missionContext: string;        // "Help Chase cross the bridge"
  targetSentence?: string;       // Optional expected answer
}
```

**Response**:
```typescript
{
  valid: boolean;
  reason?: string;               // "Words are out of order"
  encouragement: string;         // "So close! Try again!"
}
```

**Implementation**:
```typescript
// /app/api/ai/validate-sentence/route.ts

import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export async function POST(request: Request) {
  const { submittedWords, availableWords, missionContext } = await request.json();

  const sentence = submittedWords.join(' ');

  const { text } = await generateText({
    model: openai('gpt-4o-mini'),
    prompt: `
      You are validating a sentence built by a 5-year-old.

      AVAILABLE WORDS: ${availableWords.join(', ')}
      SUBMITTED: "${sentence}"
      CONTEXT: ${missionContext}

      Is this grammatically correct and meaningful?
      Be flexible with word order when valid.

      Respond with JSON:
      {"valid": true/false, "encouragement": "message for child"}
    `,
  });

  return Response.json(JSON.parse(text));
}
```

**Latency Target**: < 500ms

---

## Audio Generation

### GET `/api/audio/[wordId]`

**Purpose**: Serve cached audio or generate on-demand

**Flow**:
1. Check if word has `audioUrl`
2. If exists, redirect to Blob URL
3. If missing, generate via OpenAI TTS
4. Store in Vercel Blob
5. Update word record
6. Return audio

**Implementation**:
```typescript
// /app/api/audio/[wordId]/route.ts

import { put } from '@vercel/blob';
import OpenAI from 'openai';

const openai = new OpenAI();

export async function GET(
  request: Request,
  { params }: { params: { wordId: string } }
) {
  const word = await db.query.words.findFirst({
    where: eq(words.id, params.wordId),
  });

  if (!word) {
    return new Response('Not found', { status: 404 });
  }

  // Serve cached
  if (word.audioUrl) {
    return Response.redirect(word.audioUrl, 302);
  }

  // Generate new
  const mp3 = await openai.audio.speech.create({
    model: 'tts-1',
    voice: 'nova',
    input: word.text,
    speed: 0.9,
  });

  const buffer = Buffer.from(await mp3.arrayBuffer());

  // Store in Blob
  const blob = await put(`audio/words/${word.id}.mp3`, buffer, {
    access: 'public',
    contentType: 'audio/mpeg',
  });

  // Update database
  await db.update(words)
    .set({ audioUrl: blob.url })
    .where(eq(words.id, word.id));

  return new Response(buffer, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=31536000',
    },
  });
}
```

---

## Content Generation

### POST `/api/ai/generate-sentences`

**Request**:
```typescript
{
  topic: string;                 // "dinosaurs"
  wordLevel: 'pre-primer' | 'primer' | 'grade-1';
  count: number;                 // 5
  themeId?: string;
}
```

**Response**:
```typescript
{
  sentences: Array<{
    text: string;
    words: string[];
    distractors: string[];
  }>;
}
```

### POST `/api/ai/generate-campaign`

**Request**:
```typescript
{
  themeName: string;
  storyIdea: string;
  wordLevel: string;
  missionCount: number;
  characters: string[];
}
```

**Response**:
```typescript
{
  theme: Partial<Theme>;
  missions: Array<Partial<Mission>>;
  sentences: Array<Sentence>;
}
```

---

## Progress

### GET `/api/progress?playerId=xxx`

Returns player's full progress data.

### POST `/api/progress`

Updates progress after mission completion.

**Request**:
```typescript
{
  playerId: string;
  missionId: string;
  starsEarned: 1 | 2 | 3;
  wordResults: Array<{
    wordId: string;
    correct: boolean;
    hintsUsed: number;
  }>;
  timeSpentSeconds: number;
}
```

---

## Error Handling

All routes follow consistent error format:

```typescript
{
  error: string;
  code: string;
  details?: any;
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad request |
| 404 | Not found |
| 429 | Rate limited |
| 500 | Server error |

---

← [Technical](./README.md) | [AI Integration →](./ai-integration.md)

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
| `/api/audio/[word]` | GET | Serve/generate word audio |
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

### GET `/api/audio/[word]`

> **Updated: 2025-11-30**
> - Route param changed from `[wordId]` to `[word]` (uses word text, not ID)
> - TTS model upgraded from `tts-1` to `gpt-4o-mini-tts` with `instructions` parameter
> - Voice changed from `nova` to `coral` for better child pronunciation
> - Now proxies audio instead of redirecting (for CORS compatibility with HTML5 Audio)

**Purpose**: Serve cached audio or generate on-demand

**Flow**:
1. Look up word by text (case-insensitive)
2. If exists with `audioUrl`, proxy the blob content
3. If missing, generate via OpenAI TTS with child-friendly instructions
4. Store in Vercel Blob
5. Update word record (or create new one for on-demand words)
6. Return audio with cache headers

**Implementation**:
```typescript
// /app/api/audio/[word]/route.ts

import { put } from '@vercel/blob';
import OpenAI from 'openai';

const TTS_CONFIG = {
  model: 'gpt-4o-mini-tts',
  voice: 'coral',  // Warm, friendly voice for children
};

const TTS_INSTRUCTIONS = `You are teaching a young child (ages 4-6) to read.
- Pronounce the word clearly and distinctly
- Speak at a slightly slower pace for learning
- Use a warm and encouraging tone`;

export async function GET(
  request: Request,
  { params }: { params: { word: string } }
) {
  const wordText = decodeURIComponent(params.word).trim();

  // Look up by text (case-insensitive)
  const wordRecord = await db.query.words.findFirst({
    where: sql\`LOWER(${words.text}) = LOWER(${wordText})\`,
  });

  // Proxy cached audio
  if (wordRecord?.audioUrl) {
    const audioResponse = await fetch(wordRecord.audioUrl);
    return new Response(await audioResponse.arrayBuffer(), {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  }

  // Generate new with instructions
  const openai = new OpenAI();
  const mp3 = await openai.audio.speech.create({
    model: TTS_CONFIG.model,
    voice: TTS_CONFIG.voice,
    input: wordText,
    instructions: TTS_INSTRUCTIONS,
  });

  const buffer = Buffer.from(await mp3.arrayBuffer());

  // Store and return...
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

# API Routes

← [Back to Technical](./README.md)

> **Updated: 2025-11-30**
> Added admin CRUD endpoints for Phase 4 theme editing capabilities.

---

## Route Overview

### Game API

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/ai/validate-sentence` | POST | LLM sentence validation |
| `/api/ai/generate-sentences` | POST | Generate new sentences |
| `/api/ai/generate-campaign` | POST | Generate full campaign |
| `/api/audio/[word]` | GET | Serve/generate word audio |
| `/api/progress` | GET/POST | Player progress CRUD |
| `/api/missions` | GET | Get missions for a campaign |
| `/api/themes` | GET | Get all active themes |
| `/api/themes/[id]` | GET | Get theme details |

### Admin API (Content Management)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/admin/words` | GET | List all words with adventures |
| `/api/admin/words` | POST | Create a new word |
| `/api/admin/words/[id]` | PUT | Update word |
| `/api/admin/words/[id]` | DELETE | Delete word |
| `/api/admin/sentences` | GET | List all sentences with adventures |
| `/api/admin/sentences` | POST | Create a new sentence |
| `/api/admin/sentences/[id]` | PUT | Update sentence (including missionId) |
| `/api/admin/sentences/[id]` | DELETE | Delete sentence |

### Admin API (Theme Editor) — Phase 4

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/admin/themes` | GET | List all themes with stats |
| `/api/admin/themes` | POST | Create a new theme |
| `/api/admin/themes/[id]` | GET | Get theme with campaigns/missions |
| `/api/admin/themes/[id]` | PUT | Update theme (palette, assets, etc.) |
| `/api/admin/themes/[id]` | DELETE | Delete theme (cascade) |
| `/api/admin/campaigns` | POST | Create a new campaign |
| `/api/admin/campaigns/[id]` | GET | Get campaign with missions |
| `/api/admin/campaigns/[id]` | PUT | Update campaign |
| `/api/admin/campaigns/[id]` | DELETE | Delete campaign (cascade) |
| `/api/admin/missions` | POST | Create a new mission |
| `/api/admin/missions/[id]` | GET | Get mission with sentences |
| `/api/admin/missions/[id]` | PUT | Update mission |
| `/api/admin/missions/[id]` | DELETE | Delete mission |
| `/api/admin/upload` | POST | Upload asset to Vercel Blob |

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

## Admin Content API (Existing)

### GET `/api/admin/words`

Returns all words with computed adventure (theme) associations.

**Response**:
```typescript
{
  words: Array<{
    id: string;
    text: string;
    type: string;
    isSightWord: boolean;
    isCharacterWord: boolean;
    emoji: string | null;
    imageUrl: string | null;
    audioUrl: string | null;
    adventures: Theme[];  // Computed from sentence usage
  }>;
}
```

### POST `/api/admin/words`

Create a new word.

**Request**:
```typescript
{
  text: string;                  // Required
  type?: string;                 // Default: "custom"
  isSightWord?: boolean;         // Default: false
  isCharacterWord?: boolean;     // Default: false
  emoji?: string;
  imageUrl?: string;
}
```

### GET `/api/admin/sentences`

Returns all sentences with computed adventure (theme) associations.

**Response**:
```typescript
{
  sentences: Array<{
    id: string;
    text: string;
    orderedWords: string[];
    distractors: string[];
    missionId: string | null;
    order: number;
    adventure: Theme | null;  // Computed from mission → campaign → theme
  }>;
}
```

### POST `/api/admin/sentences`

Create a new sentence.

**Request**:
```typescript
{
  text: string;                  // Required
  distractors?: string[];        // Default: []
}
```

**Notes**:
- `orderedWords` is auto-parsed from `text`
- All words must exist in the word bank
- Returns `missingWords` error if any words are missing

---

## Theme Editor API (Phase 4)

### GET `/api/admin/themes`

List all themes with campaign and mission counts.

**Response**:
```typescript
{
  themes: Array<{
    id: string;
    name: string;
    displayName: string;
    isActive: boolean;
    isCustom: boolean;
    campaignCount: number;
    missionCount: number;
    sentenceCount: number;
  }>;
}
```

### GET `/api/admin/themes/[id]`

Get full theme with nested campaigns and missions.

**Response**:
```typescript
{
  theme: {
    id: string;
    name: string;
    displayName: string;
    palette: ThemePalette | null;
    assets: ThemeAssets | null;
    characters: ThemeCharacter[] | null;
    feedbackPhrases: FeedbackPhrases | null;
    feedbackAudioUrls: FeedbackAudioUrls | null;
    isActive: boolean;
    isCustom: boolean;
    campaigns: Array<{
      id: string;
      title: string;
      synopsis: string | null;
      artwork: CampaignArtwork | null;
      order: number;
      missions: Array<{
        id: string;
        title: string;
        type: string;
        order: number;
        sentenceCount: number;
      }>;
    }>;
  };
}
```

### PUT `/api/admin/themes/[id]`

Update theme properties.

**Request**:
```typescript
{
  name?: string;
  displayName?: string;
  palette?: ThemePalette;
  assets?: ThemeAssets;
  characters?: ThemeCharacter[];
  feedbackPhrases?: FeedbackPhrases;
  isActive?: boolean;
}
```

### DELETE `/api/admin/themes/[id]`

Delete a theme and cascade delete all campaigns, missions, and unassign sentences.

**Response**:
```typescript
{
  deleted: {
    themes: 1;
    campaigns: number;
    missions: number;
    sentencesUnassigned: number;
  };
}
```

### POST `/api/admin/campaigns`

Create a new campaign within a theme.

**Request**:
```typescript
{
  themeId: string;               // Required
  title: string;                 // Required
  synopsis?: string;
  artwork?: CampaignArtwork;
}
```

### PUT `/api/admin/campaigns/[id]`

Update campaign properties.

**Request**:
```typescript
{
  title?: string;
  synopsis?: string;
  artwork?: CampaignArtwork;
  order?: number;
  isActive?: boolean;
}
```

### DELETE `/api/admin/campaigns/[id]`

Delete a campaign and cascade delete all missions.

### POST `/api/admin/missions`

Create a new mission within a campaign.

**Request**:
```typescript
{
  campaignId: string;            // Required
  title: string;                 // Required
  type?: 'play' | 'treasure' | 'boss';  // Default: 'play'
  narrativeIntro?: string;
  narrativeOutro?: string;
  scaffoldingLevel?: number;
  artwork?: MissionArtwork;
  unlockReward?: UnlockReward;
}
```

### PUT `/api/admin/missions/[id]`

Update mission properties.

**Request**:
```typescript
{
  title?: string;
  type?: string;
  narrativeIntro?: string;
  narrativeOutro?: string;
  scaffoldingLevel?: number;
  artwork?: MissionArtwork;
  unlockReward?: UnlockReward;
  order?: number;
  isActive?: boolean;
}
```

### PUT `/api/admin/sentences/[id]`

Update sentence, including mission assignment.

**Request**:
```typescript
{
  text?: string;
  distractors?: string[];
  missionId?: string | null;     // Assign to mission or unassign
  order?: number;                // Position within mission
}
```

### POST `/api/admin/upload`

Upload an asset to Vercel Blob storage.

**Request**: `multipart/form-data`
- `file`: Image file (PNG, JPG, WebP)
- `type`: Asset type (`theme`, `campaign`, `mission`, `character`)
- `entityId`: ID of the entity this asset belongs to

**Response**:
```typescript
{
  url: string;                   // Vercel Blob URL
  pathname: string;
  contentType: string;
  size: number;
}
```

---

← [Technical](./README.md) | [AI Integration →](./ai-integration.md)

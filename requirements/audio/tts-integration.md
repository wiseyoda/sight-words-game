# TTS Integration

← [Back to Audio](./README.md)

---

## Overview

All word audio is generated on-demand using OpenAI's TTS API, then cached for future use.

---

## OpenAI TTS Configuration

> **Updated: 2025-11-30**
> Upgraded from `tts-1` to `gpt-4o-mini-tts` model with `instructions` parameter.
> This enables better control over voice tone, speed, and pronunciation for children.

~~```typescript~~
~~const ttsConfig = {~~
~~  model: 'tts-1',          // Standard quality (faster)~~
~~  voice: 'nova',           // Warm, clear voice~~
~~  speed: 0.9,              // Slightly slower for clarity~~
~~  response_format: 'mp3',  // Broad compatibility~~
~~};~~
~~```~~

```typescript
const ttsConfig = {
  model: 'gpt-4o-mini-tts',  // Latest model with instructions support
  voice: 'coral',            // Warm, friendly voice for children
  response_format: 'mp3',    // Broad compatibility
};

const TTS_INSTRUCTIONS = `You are teaching a young child (ages 4-6) to read.
- Pronounce the word clearly and distinctly
- Speak at a slightly slower pace for learning
- Use a warm and encouraging tone
- This is a sight word the child is learning to recognize`;
```

### Voice Options

> **Updated: 2025-11-30**
> `gpt-4o-mini-tts` provides 11 built-in voices with instruction-based control.

| Voice | Character | Best For |
|-------|-----------|----------|
| **coral** | Warm, friendly | **Default for children** |
| nova | Friendly, upbeat | Alternative |
| alloy | Neutral, balanced | Backup |
| sage | Calm, reassuring | Alternative |
| shimmer | Bright, energetic | Alternative |
| fable | Expressive, storytelling | Narrative audio |
| ballad | Melodic, expressive | Songs/rhymes |
| ash | Clear, professional | Not for kids |
| echo | Clear, measured | Not for kids |
| onyx | Deep, authoritative | Not for kids |

---

## Generation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    AUDIO GENERATION FLOW                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Word needed in game                                     │
│     ↓                                                        │
│  2. Check word.audioUrl in database                         │
│     ├── Exists → Serve from Vercel Blob                     │
│     └── Missing → Continue to step 3                        │
│     ↓                                                        │
│  3. Call OpenAI TTS API                                     │
│     POST https://api.openai.com/v1/audio/speech             │
│     Body: { model, voice, input: wordText, speed }          │
│     ↓                                                        │
│  4. Receive MP3 audio stream                                │
│     ↓                                                        │
│  5. Upload to Vercel Blob                                   │
│     Returns: blob URL                                        │
│     ↓                                                        │
│  6. Update word.audioUrl in database                        │
│     ↓                                                        │
│  7. Return audio URL to client                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## API Route Implementation

```typescript
// /api/audio/[wordId]/route.ts

export async function GET(
  request: Request,
  { params }: { params: { wordId: string } }
) {
  const word = await getWord(params.wordId);

  if (!word) {
    return new Response('Word not found', { status: 404 });
  }

  // Check if audio already exists
  if (word.audioUrl) {
    // Redirect to cached audio
    return Response.redirect(word.audioUrl);
  }

  // Generate new audio
  const audioBuffer = await generateTTS(word.text);

  // Upload to Vercel Blob
  const blob = await put(`audio/${word.id}.mp3`, audioBuffer, {
    access: 'public',
    contentType: 'audio/mpeg',
  });

  // Update database
  await updateWord(word.id, { audioUrl: blob.url });

  // Return the audio
  return new Response(audioBuffer, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=31536000',
    },
  });
}
```

---

## Caching Strategy

### Vercel Blob Storage

- **Storage**: Generated MP3 files
- **Access**: Public URLs
- **CDN**: Vercel Edge Network
- **Cost**: Pay per storage + bandwidth

### Database Reference

```typescript
type Word = {
  id: string;
  text: string;
  audioUrl: string | null;  // Blob URL when generated
  audioGeneratedAt: Date | null;
};
```

### Browser Caching

```typescript
// Response headers for audio
{
  'Cache-Control': 'public, max-age=31536000, immutable',
  'Content-Type': 'audio/mpeg',
}
```

### Preloading

> **Updated: 2025-11-29**
> Howler.js preloading replaced with HTML5 Audio API approach.

~~```typescript~~
~~// Preload mission words~~
~~async function preloadMissionAudio(missionId: string) {~~
~~  const mission = await getMission(missionId);~~
~~  const words = await getMissionWords(mission);~~

~~  // Preload in parallel~~
~~  await Promise.all(~~
~~    words.map(word =>~~
~~      new Howl({~~
~~        src: [word.audioUrl],~~
~~        preload: true,~~
~~      })~~
~~    )~~
~~  );~~
~~}~~
~~```~~

**Current approach**: Audio is fetched on-demand. For future preloading, use `Audio.preload`:

```typescript
// Preload mission words with HTML5 Audio
async function preloadMissionAudio(words: Word[]) {
  await Promise.all(
    words.map(word => {
      const audio = new Audio(word.audioUrl);
      audio.preload = 'auto';
      return new Promise(resolve => {
        audio.oncanplaythrough = resolve;
        audio.onerror = resolve; // Don't block on errors
      });
    })
  );
}
```

---

## Sentence Playback

> **Added: 2025-11-29**
> Sentence audio plays after correct submission to reinforce learning.

### Real-Time Sentence TTS

After a child correctly completes a sentence, the full sentence is read aloud to reinforce the words.

> **Updated: 2025-11-30**
> Now uses `gpt-4o-mini-tts` with `instructions` for child-appropriate delivery.

```typescript
// /api/audio/sentence/route.ts
const TTS_INSTRUCTIONS = `You are reading a sentence to a young child (ages 4-6) who is learning to read.
- Speak clearly at a slightly slower pace for comprehension
- Pronounce each word distinctly with proper enunciation
- Use a warm and friendly tone
- Maintain natural rhythm and intonation`;

export async function POST(request: NextRequest) {
  const { sentence } = await request.json();

  const response = await openai.audio.speech.create({
    model: 'gpt-4o-mini-tts',
    voice: 'coral',
    input: sentence,
    instructions: TTS_INSTRUCTIONS,
  });

  return new NextResponse(Buffer.from(await response.arrayBuffer()), {
    headers: { 'Content-Type': 'audio/mpeg' },
  });
}
```

### Client Hook

```typescript
// useSentenceAudio.ts
export function useSentenceAudio() {
  const [isPlaying, setIsPlaying] = useState(false);

  const play = useCallback(async (sentence: string) => {
    const response = await fetch('/api/audio/sentence', {
      method: 'POST',
      body: JSON.stringify({ sentence }),
    });
    const blob = await response.blob();
    const audio = new Audio(URL.createObjectURL(blob));
    await audio.play();
  }, []);

  return { play, isPlaying };
}
```

### Why Not Cache Sentences?

- Sentences are dynamic and numerous
- Caching all possible sentences is impractical
- Real-time generation is fast enough (~500ms)
- Cost is minimal (~$0.0001 per sentence)

---

## Phrase Generation

### Feedback Phrases

Pre-generate common phrases per theme:

```typescript
const feedbackPhrases = {
  correct: [
    'You did it!',
    'Amazing!',
    'Great job!',
    'Perfect!',
    'Wonderful!',
  ],
  encourage: [
    'Almost! Try again!',
    'So close!',
    'Keep going!',
    'You can do it!',
  ],
  celebrate: [
    'Mission complete!',
    'You are a star!',
    'Incredible!',
  ],
};

// Generate all on theme creation
async function generateThemePhrases(themeId: string) {
  const theme = await getTheme(themeId);

  for (const [type, phrases] of Object.entries(theme.feedbackPhrases)) {
    for (const phrase of phrases) {
      await generateAndCachePhrase(themeId, type, phrase);
    }
  }
}
```

---

## Error Handling

### API Failures

> **Updated: 2025-11-30**
> Using `gpt-4o-mini-tts` with instructions parameter.

```typescript
async function generateTTS(text: string, retries = 3): Promise<Buffer> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await openai.audio.speech.create({
        model: 'gpt-4o-mini-tts',
        voice: 'coral',
        input: text,
        instructions: TTS_INSTRUCTIONS,
      });
      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      if (i === retries - 1) throw error;
      await sleep(1000 * (i + 1)); // Exponential backoff
    }
  }
}
```

### Fallback Behavior

If TTS fails:
1. Log error for admin review
2. Show word visually (no audio)
3. Allow gameplay to continue
4. Retry generation on next request

---

## Cost Considerations

### OpenAI Pricing (as of 2025)

> **Updated: 2025-11-30**
> Using `gpt-4o-mini-tts` for better quality and instruction-based control.

| Model | Price | Notes |
|-------|-------|-------|
| gpt-4o-mini-tts | $0.015 / 1K chars | **Recommended** - Latest with instructions |
| ~~tts-1~~ | ~~$0.015 / 1K chars~~ | ~~Standard quality~~ (deprecated) |
| ~~tts-1-hd~~ | ~~$0.030 / 1K chars~~ | ~~Higher quality~~ (deprecated) |

### Estimated Costs

| Content | Characters | Cost |
|---------|------------|------|
| 133 Dolch words | ~800 | ~$0.01 |
| 50 custom words | ~400 | ~$0.01 |
| 100 feedback phrases | ~2000 | ~$0.03 |
| Full theme (300 items) | ~3000 | ~$0.05 |

**Total for full launch**: ~$0.50-1.00

---

## Admin Controls

### Regenerate Audio

```
┌─────────────────────────────────────────────────────────────┐
│  AUDIO REGENERATION                                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [Regenerate All Words]     Estimated: $0.02                │
│  [Regenerate Theme Phrases] Estimated: $0.01                │
│  [Regenerate Single Word]   Select word...                  │
│                                                              │
│  Voice Preview:                                              │
│  ( ) nova    [▶️ Preview]                                    │
│  ( ) shimmer [▶️ Preview]                                    │
│  ( ) alloy   [▶️ Preview]                                    │
│                                                              │
│  Speed: [0.9 ▼]                                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

← [Audio](./README.md) | [Sound Design →](./sound-design.md)

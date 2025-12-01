# Sound Design

← [Back to Audio](./README.md)

> **Updated: 2025-11-30**
> Comprehensive update reflecting actual implementation with HTML5 Audio API and Web Audio API.

---

## Current Implementation Overview

The audio system uses a combination of approaches:

| Category | Technology | Implementation |
|----------|-----------|----------------|
| Word TTS | HTML5 Audio + OpenAI TTS | `useWordAudio` hook |
| Sentence TTS | HTML5 Audio + OpenAI TTS | `useSentenceAudio` hook |
| Theme Feedback | HTML5 Audio + pre-generated TTS | `useThemeFeedback` hook |
| UI Sound Effects | Web Audio API (synthesized) | `useSoundEffects` hook |

**Key files**:
- `/src/lib/audio/useWordAudio.ts`
- `/src/lib/audio/useSentenceAudio.ts`
- `/src/lib/audio/useThemeFeedback.ts`
- `/src/lib/audio/useSoundEffects.ts`

---

## Audio Hooks

### useWordAudio

Plays word pronunciation via the `/api/audio/[word]` endpoint.

```typescript
// /src/lib/audio/useWordAudio.ts

export function useWordAudio(word: string) {
  const { play, isLoading } = useWordAudio("cat");

  // Features:
  // - Auto-generates TTS via OpenAI if not cached
  // - Stores audio in Vercel Blob for caching
  // - Automatic retry on failure (up to 2 retries)
  // - Skips punctuation (., !, ?)

  return { play, isLoading };
}
```

**Usage**:
```tsx
const { play } = useWordAudio("the");
<WordCard onClick={play} />
```

### useSentenceAudio

Plays full sentence audio via real-time TTS.

```typescript
// /src/lib/audio/useSentenceAudio.ts

export function useSentenceAudio() {
  const { play, stop, isPlaying } = useSentenceAudio();

  // Features:
  // - Real-time TTS generation (not cached)
  // - Creates blob URL from API response
  // - Automatic cleanup of blob URLs

  return { play, stop, isPlaying };
}
```

**Usage**:
```tsx
const { play, isPlaying } = useSentenceAudio();
<Button onClick={() => play("The cat can run.")}>
  {isPlaying ? "Playing..." : "Hear My Sentence"}
</Button>
```

### useThemeFeedback

Plays theme-specific feedback phrases (pre-generated TTS stored in Vercel Blob).

```typescript
// /src/lib/audio/useThemeFeedback.ts

export function useThemeFeedback() {
  const {
    playCorrectFeedback,    // "Paw-some!", "Great job!"
    playEncourageFeedback,  // "Almost! Try again!"
    playCelebrateFeedback,  // "Mission complete!"
    stop,
    hasAudio,               // Check if theme has audio
    isReady
  } = useThemeFeedback();

  // Features:
  // - Random selection from phrase pool (avoids repeats)
  // - Falls back gracefully if no audio available
  // - Theme-aware via ThemeProvider

  return { ... };
}
```

**Usage**:
```tsx
const { playCorrectFeedback } = useThemeFeedback();
if (isCorrect) await playCorrectFeedback();
```

### useSoundEffects

Synthesized UI sounds using Web Audio API (no external files needed).

```typescript
// /src/lib/audio/useSoundEffects.ts

const SOUNDS = {
  correct:  { frequency: 523.25, duration: 0.15, type: "sine" },     // C5
  incorrect: { frequency: 200,   duration: 0.2,  type: "sine" },
  tap:      { frequency: 800,   duration: 0.05, type: "sine" },
  star:     { frequency: 880,   duration: 0.1,  type: "sine" },      // A5
  fanfare:  { frequency: 659.25, duration: 0.3,  type: "triangle" }, // E5
};

export function useSoundEffects() {
  const {
    play,           // Generic: play("correct")
    playCorrect,    // Shorthand methods
    playIncorrect,
    playTap,
    playStar,
    playFanfare,
    playCelebration, // C major chord arpeggio
  } = useSoundEffects();

  return { ... };
}
```

**Celebration chord** (C major arpeggio):
```typescript
// Plays C5, E5, G5 in sequence (100ms apart)
playCelebration();
```

---

## Sound Effects

### UI Sounds

| Event | Sound | Duration | Feel |
|-------|-------|----------|------|
| Button tap | Soft click | 50ms | Responsive |
| Card tap | Soft pop | 100ms | Satisfying |
| Card place | Gentle whoosh | 150ms | Confirming |
| Card remove | Reverse whoosh | 150ms | Neutral |
| Navigation | Swoosh | 200ms | Smooth |

### Game Feedback (Synth)

| Event | Implementation | Notes |
|-------|---------------|-------|
| Correct sentence | `playCorrect()` | C5 sine wave, 150ms |
| Incorrect attempt | `playIncorrect()` | 200Hz sine, 200ms (gentle) |
| Card tap | `playTap()` | 800Hz sine, 50ms |
| Star earned | `playStar()` | A5 sine, 100ms |
| Mission complete | `playCelebration()` | C major chord |

### Avoid These Sounds

- Harsh buzzers
- Error beeps
- Sad/negative tones
- Jump scares
- Annoying loops

---

## Background Music (Phase 4)

### Requirements

- Loopable (seamless)
- Low energy (not distracting)
- Theme-appropriate
- Instrumental only
- Kid-friendly

### Per Theme

| Theme | Style | BPM | Mood |
|-------|-------|-----|------|
| Paw Patrol | Adventure | 100 | Upbeat, heroic |
| Bluey | Acoustic folk | 90 | Warm, playful |
| Marvel | Epic orchestral | 110 | Heroic, exciting |

### Tracks Needed

| Screen | Track | Duration |
|--------|-------|----------|
| Story Map | Theme ambient | 2-3 min loop |
| Gameplay | Light tension | 2-3 min loop |
| Celebration | Victory fanfare | 10-15 sec |
| Menu | Gentle theme | 1-2 min loop |

---

## ~~Audio Sprites (Howler.js)~~ Superseded

> **Updated: 2025-11-29**
> Audio sprites with Howler.js have been superseded by direct HTML5 Audio API usage.
> Reason: Simpler implementation for our TTS-focused use case. Future SFX may use sprites.

~~Bundle related sounds into sprites for efficiency:~~

~~```javascript~~
~~const uiSprite = new Howl({~~
~~  src: ['/audio/ui-sprite.mp3'],~~
~~  sprite: {~~
~~    click: [0, 50],~~
~~    pop: [50, 100],~~
~~    whoosh: [150, 150],~~
~~    swoosh: [300, 200],~~
~~  }~~
~~});~~
~~```~~

### Future Sprite Organization (if needed)

| Sprite | Contents |
|--------|----------|
| ui-sprite | Click, pop, whoosh, swoosh |
| feedback-sprite | Chime, boing, sparkle |
| celebration-sprite | Fanfare, star-ding, unlock |

---

## TTS Configuration

### OpenAI TTS Settings

```typescript
const TTS_CONFIG = {
  model: 'gpt-4o-mini-tts',    // High quality, fast
  voice: 'coral',              // Warm, friendly for children
};

const TTS_INSTRUCTIONS = `You are teaching a young child (ages 4-6) to read.
- Pronounce the word clearly and distinctly
- Speak at a slightly slower pace for learning
- Use a warm and encouraging tone`;
```

### Available Voices

| Voice | Character | Best For |
|-------|-----------|----------|
| alloy | Neutral, balanced | General |
| coral | Warm, friendly | **Children (recommended)** |
| echo | Clear, measured | Instructions |
| fable | Expressive, storytelling | Narratives |
| nova | Friendly, upbeat | Encouragement |
| shimmer | Bright, energetic | Celebration |

### Audio Storage

- **Word audio**: Vercel Blob (`words.audioUrl`)
- **Theme feedback**: Vercel Blob (`themes.feedbackAudioUrls`)
- **Sentence audio**: Real-time (not cached)

---

## Voice Feedback Phrases

### General Phrases

**Correct (random selection)**:
- "You did it!"
- "Amazing!"
- "Great job!"
- "Perfect!"
- "Wonderful!"
- "Excellent!"
- "Super!"
- "Fantastic!"

**Encouragement (random selection)**:
- "Almost! Try again!"
- "So close!"
- "Keep going!"
- "You can do it!"
- "Good try!"
- "One more time!"

**Celebration (mission complete)**:
- "Mission complete!"
- "You are amazing!"
- "Incredible work!"

### Theme-Specific Phrases

**Paw Patrol**:
- "Paw-some!"
- "You're on the case!"
- "No job too big, no pup too small!"

**Bluey**:
- "For real life!"
- "Wackadoo!"
- "Dance mode unlocked!"

**Marvel**:
- "Suit up!"
- "Mission accomplished!"
- "Avengers assemble!"

---

## Accessibility

### Audio Alternatives

Every audio event has visual equivalent:
- Word pronunciation → Word displayed
- Correct sound → Green glow
- Incorrect sound → Shake animation
- Celebration → Confetti particles

### Captions Mode

Optional setting to show text for voice:
```
┌────────────────────────────┐
│  🔊 "You did it!"          │
└────────────────────────────┘
```

### Volume Controls

- Each channel independently controllable
- Mute all option
- Saved per profile

---

## Performance

### Current Approach

Audio is loaded on-demand with caching at the API level:

```typescript
// Word audio is fetched and cached automatically
const { play } = useWordAudio("the");

// First request: generates TTS, stores in Blob, returns audio
// Subsequent requests: proxies cached audio from Blob
```

### Retry Mechanism

```typescript
// useWordAudio includes automatic retry on failure
audio.onerror = () => {
  if (retryCountRef.current < 2) {
    retryCountRef.current++;
    setTimeout(() => {
      const retryAudio = new Audio(audioUrl + `?retry=${Date.now()}`);
      retryAudio.play();
    }, 500);
  }
};
```

### Memory Management

- Each hook manages its own Audio instance via `useRef`
- Previous audio is stopped/paused before new playback
- Blob URLs are revoked after playback (`URL.revokeObjectURL`)
- Web Audio oscillators auto-stop after duration

### ~~Preloading Strategy~~ Superseded

> Preloading with Howler.js has been replaced by on-demand loading with API-level caching.

~~```typescript~~
~~const preloadMissionAudio = async (missionId: string) => {~~
~~  const words = await getMissionWords(missionId);~~
~~  await Promise.all(words.map(word => new Howl({ src: [word.audioUrl] })));~~
~~};~~
~~```~~

---

## Audio Generation Scripts

### Word Audio Generation

```bash
# Generate audio for all words without audioUrl
npm run audio:generate

# Force regenerate all audio
npm run audio:generate -- --force
```

Script: `scripts/generate-audio.ts`

### Theme Feedback Audio

```bash
# Generate feedback phrase audio for all themes
npx tsx scripts/generate-theme-audio.ts
```

Script: `scripts/generate-theme-audio.ts`

---

## Phase 4 Audio Tasks

| Task | Status |
|------|--------|
| Word TTS pipeline | ✅ Complete |
| Sentence TTS pipeline | ✅ Complete |
| Theme feedback audio | ✅ Complete |
| Web Audio synth effects | ✅ Complete |
| SFX pack per theme | ⏳ Planned |
| Background music | ⏳ Planned |
| Mute toggle UI | ⏳ Planned |
| Volume balancing | ⏳ Planned |

---

← [Audio](./README.md)

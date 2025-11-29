# Sound Design

← [Back to Audio](./README.md)

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

### Game Feedback

| Event | Sound | Duration | Feel |
|-------|-------|----------|------|
| Correct sentence | Celebration chime | 500ms | Joyful |
| Incorrect attempt | Soft boing | 200ms | Gentle |
| Hint activated | Magical sparkle | 300ms | Helpful |
| Mission complete | Fanfare | 1500ms | Triumphant |
| Star earned | Ascending ding | 200ms | Rewarding |
| Unlock | Magical reveal | 500ms | Exciting |
| Level up | Ascending tones | 800ms | Achievement |

### Avoid These Sounds

- Harsh buzzers
- Error beeps
- Sad/negative tones
- Jump scares
- Annoying loops

---

## Background Music

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

## Audio Sprites

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

~~// Usage~~
~~uiSprite.play('click');~~
~~```~~

### Sprite Organization

| Sprite | Contents |
|--------|----------|
| ui-sprite | Click, pop, whoosh, swoosh |
| feedback-sprite | Chime, boing, sparkle |
| celebration-sprite | Fanfare, star-ding, unlock |

---

## ~~Implementation with Howler.js~~ Implementation with HTML5 Audio API

> **Updated: 2025-11-29**
> Replaced Howler.js with native HTML5 Audio API for simplicity.

### ~~Audio Manager (Howler.js)~~ Current Implementation

~~```typescript~~
~~// /lib/audio/AudioManager.ts~~

~~class AudioManager {~~
~~  private voice: Howl | null = null;~~
~~  private effects: Howl | null = null;~~
~~  private music: Howl | null = null;~~

~~  private volumeSettings = {~~
~~    voice: 1.0,~~
~~    effects: 0.7,~~
~~    music: 0.3,~~
~~  };~~

~~  async playWord(wordId: string, audioUrl: string) {~~
~~    // Stop any current voice~~
~~    this.voice?.stop();~~

~~    this.voice = new Howl({~~
~~      src: [audioUrl],~~
~~      volume: this.volumeSettings.voice,~~
~~      onend: () => {~~
~~        this.voice = null;~~
~~      },~~
~~    });~~

~~    this.voice.play();~~
~~  }~~

~~  playEffect(name: 'click' | 'pop' | 'chime' | 'boing') {~~
~~    // Play from sprite~~
~~    this.effects?.play(name);~~
~~  }~~

~~  setVolume(channel: 'voice' | 'effects' | 'music', volume: number) {~~
~~    this.volumeSettings[channel] = volume;~~
~~    // Update active sounds~~
~~  }~~

~~  muteAll() {~~
~~    Howler.mute(true);~~
~~  }~~

~~  unmuteAll() {~~
~~    Howler.mute(false);~~
~~  }~~
~~}~~

~~export const audioManager = new AudioManager();~~
~~```~~

**Current approach**: Audio is played directly via HTML5 Audio API in React components using `useWordAudio` and `useSentenceAudio` hooks. See `/src/hooks/useWordAudio.ts` for implementation.

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

### Preloading Strategy

```typescript
// Preload on mission start
const preloadMissionAudio = async (missionId: string) => {
  const words = await getMissionWords(missionId);

  // Load all word audio in parallel
  await Promise.all(
    words.map(word => {
      return new Promise<void>((resolve) => {
        const sound = new Howl({
          src: [word.audioUrl],
          preload: true,
          onload: () => resolve(),
          onloaderror: () => resolve(), // Don't block on error
        });
      });
    })
  );
};
```

### Memory Management

- Unload audio when leaving screen
- Limit concurrent sounds (max 3)
- Use audio sprites for small sounds
- Lazy load music (lower priority)

---

← [Audio](./README.md)

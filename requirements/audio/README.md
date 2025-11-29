# Audio System

← [Back to Index](../README.md)

---

## Overview

Audio is critical for the learning experience. Words are read aloud, feedback is immediate, and the soundscape creates engagement.

## Documents in This Section

| Document | Description |
|----------|-------------|
| [TTS Integration](./tts-integration.md) | OpenAI TTS setup and caching |
| [Sound Design](./sound-design.md) | SFX, music, and feedback audio |

---

## Audio Philosophy

> **"Hear it to learn it."**

Children learn sight words by associating visual form with spoken sound. Every word interaction includes audio.

---

## Audio Channels

Three independent channels with separate volume controls:

| Channel | Content | Default | Purpose |
|---------|---------|---------|---------|
| **Voice** | Word pronunciation, feedback phrases | 100% | Learning core |
| **Effects** | Taps, chimes, celebrations | 70% | Engagement |
| **Music** | Background ambiance | 30% | Atmosphere |

---

## Key Specifications

### TTS (Text-to-Speech)

| Aspect | Specification |
|--------|---------------|
| Provider | OpenAI TTS API |
| Voice | "nova" or "shimmer" |
| Speed | 0.9x (slightly slower) |
| Format | MP3 (128kbps) |
| Storage | Vercel Blob |

### Audio Playback

| Aspect | Specification |
|--------|---------------|
| ~~Library~~ | ~~Howler.js~~ |
| **Library** | **HTML5 Audio API** |
| Format | MP3 primary, WebM fallback |
| Latency | < 100ms for cached |
| Preload | Current mission words |

> **Updated: 2025-11-29**
> Changed from Howler.js to native HTML5 Audio API.
> Reason: Simpler implementation without external dependency. Native Audio API provides sufficient functionality for our use case (on-demand TTS playback).

### On-Demand Generation

```
Word Needed → Check Cache → Cache Miss → OpenAI API → Store in Blob → Serve
                          → Cache Hit → Serve from Blob
```

---

## Audio Events

### Words

| Event | Audio |
|-------|-------|
| Tap word in bank | Word pronunciation |
| Place word in slot | Word pronunciation |
| Remove word from slot | Word pronunciation |
| Hint shows word | Word pronunciation |
| Sentence complete | Full sentence read |

### Feedback

| Event | Audio |
|-------|-------|
| Correct answer | Chime + voice phrase |
| Incorrect answer | Soft boing + encouragement |
| Mission complete | Fanfare + celebration phrase |
| Star earned | Ascending ding |
| Unlock | Magical reveal sound |

### UI

| Event | Audio |
|-------|-------|
| Button tap | Soft click |
| Navigation | Whoosh |
| Error/blocked | Gentle buzz |
| Loading complete | Subtle chime |

---

## Volume Controls

```
┌─────────────────────────────────────────────────────────────┐
│                    AUDIO SETTINGS                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   🔊 Voice               [████████████████░░░░] 80%         │
│   Word sounds and feedback phrases                          │
│                                                              │
│   🎵 Effects             [██████████░░░░░░░░░░] 50%         │
│   Taps, chimes, celebrations                                │
│                                                              │
│   🎶 Music               [████░░░░░░░░░░░░░░░░] 20%         │
│   Background ambiance                                        │
│                                                              │
│   [🔇 Mute All]                                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Never Play

- Harsh buzzers or error sounds
- Scary or startling sounds
- Loud sudden noises
- Overlapping voices
- Annoying repetitive loops

---

← [Back to Index](../README.md) | [TTS Integration →](./tts-integration.md)

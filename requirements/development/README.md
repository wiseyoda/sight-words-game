# Development Roadmap

← [Back to Index](../README.md)

---

## Overview

Development is organized into 5 phases, each building on the previous.

## Documents in This Section

| Document | Description |
|----------|-------------|
| [Phase 1: Engine](./phase-1-engine.md) | Core mechanics |
| [Phase 2: Juice](./phase-2-juice.md) | Polish and feel |
| [Phase 3: AI & Admin](./phase-3-ai-admin.md) | AI features, dashboard |
| [Phase 4: Themes](./phase-4-themes.md) | Theme implementation |
| [Phase 5: Beyond](./phase-5-beyond.md) | Mini-games, future |

---

## Phase Summary

| Phase | Focus | Key Deliverables |
|-------|-------|------------------|
| **1** | The Engine | Sentence builder, AI validation, TTS, basic play |
| **2** | The "Juice" | Animations, story map, feedback, hints |
| **3** | AI & Admin | Dashboard, AI generators, progress reports |
| **4** | Themes & Polish | 3 launch themes, sound design, testing |
| **5** | Beyond | Mini-games, additional content, future features |

---

## Phase 1: The Engine

**Goal**: Playable core loop with AI validation

- [ ] Next.js 14 scaffold, deploy to Vercel
- [ ] Database schema (Drizzle + Vercel Postgres)
- [ ] Core Sentence Builder (tap-to-place + drag)
- [ ] AI Sentence Validation API (LLM-powered)
- [ ] On-demand TTS API (OpenAI)
- [ ] Basic game state (Zustand)
- [ ] Word audio playback (Howler.js)
- [ ] Simple admin: Add word, add sentence
- [ ] Basic "Play" mode with test sentences

**Exit Criteria**: Child can complete a sentence and hear validation result.

---

## Phase 2: The "Juice"

**Goal**: Game feels polished and engaging

- [ ] Framer Motion animations (cards, celebrations)
- [ ] Story Map UI with node navigation
- [ ] Mission flow (intro → gameplay → reward)
- [ ] Progressive hint system
- [ ] Correct/incorrect feedback (visual + audio)
- [ ] Star rating per mission
- [ ] Progress persistence

**Exit Criteria**: Complete mission flow feels like a real game.

---

## Phase 3: AI & Admin

**Goal**: Parents can manage and create content

- [ ] Parent dashboard structure
- [ ] Parental gate (math problem)
- [ ] Player profile management
- [ ] Progress reports
- [ ] "Magic Level Creator" (AI sentence generation)
- [ ] "Story Generator" (AI campaign creation)
- [ ] Library management (words, sentences)

**Exit Criteria**: Parent can create custom content with AI.

---

## Phase 4: Themes & Polish

**Goal**: Ship-ready with 3 themes

- [ ] Theme engine (dynamic styling)
- [ ] Paw Patrol theme (full implementation)
- [ ] Bluey theme
- [ ] Marvel theme
- [ ] Sound effects pack
- [ ] Background music per theme
- [ ] Performance optimization
- [ ] Real-world testing with kids

**Exit Criteria**: Polished, themed experience ready for daily use.

---

## Phase 5: Beyond (Post-Launch)

- [ ] Word Bingo mini-game
- [ ] Memory Match mini-game
- [ ] Whack-a-Word mini-game
- [ ] Sticker collection UI
- [ ] Additional themes
- [ ] Voice recognition (future)
- [ ] Multiplayer (future)

---

← [Back to Index](../README.md) | [Phase 1 →](./phase-1-engine.md)

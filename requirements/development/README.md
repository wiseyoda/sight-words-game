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

## Phase 1: The Engine ✅ (Complete)

**Goal**: Playable core loop with AI validation

- [x] Next.js 14 scaffold, deploy to Vercel (2025-11-29)
- [x] Database schema (Drizzle + Vercel Postgres) (2025-11-29)
- [x] Core Sentence Builder (tap-to-place + drag) (2025-11-29)
- [x] AI Sentence Validation API (LLM-powered) (2025-11-29)
- [x] On-demand TTS API (OpenAI) (2025-11-29)
- [x] Basic game state (Zustand) (2025-11-29)
- [x] Word audio playback (HTML5 Audio API) (2025-11-29)
- [x] Simple admin: Add word, add sentence (2025-11-29)
- [x] Basic "Play" mode with test sentences (2025-11-29)

**Exit Criteria**: Child can complete a sentence and hear validation result.

**Status**: ✅ Phase 1 Complete! Core gameplay functional with basic admin CRUD.

---

## Phase 2: The "Juice" ✅ (Complete)

**Goal**: Game feels polished and engaging

- [x] Framer Motion animations (cards, celebrations) (2025-11-29)
- [x] Story Map UI with node navigation (built, not integrated) (2025-11-29)
- [x] Mission flow (intro → gameplay → reward) (2025-11-29)
- [x] Progressive hint system (3 levels + auto-hints) (2025-11-29)
- [x] Correct/incorrect feedback (visual + audio) (2025-11-29)
- [x] Star rating per mission (2025-11-29)
- [ ] Progress persistence *(Phase 3 - requires player profiles)*

**Exit Criteria**: Complete mission flow feels like a real game.

**Status**: ✅ Phase 2 Complete! Mission flow and hint system fully functional.
- 2 items deferred: Character display and voice phrases (Phase 4 - Themes)

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

# Development Phases (Detailed)

← [Back to Development](./README.md)

---

## Phase 1: The Engine

### Objective

Build the core sentence-building mechanic with AI validation.

### Tasks

#### Project Setup

- [x] Initialize Next.js 14 with App Router (2025-11-29)
- [x] Configure TypeScript strict mode (2025-11-29)
- [x] Set up Tailwind CSS (2025-11-29)
- [x] Deploy to Vercel (2025-11-29)
- [x] Configure environment variables (2025-11-29)

#### Database

- [x] Set up Prisma Postgres (2025-11-29)
- [x] Install and configure Drizzle ORM (2025-11-29)
- [x] Create schema: words, sentences, players (2025-11-29)
- [x] Push schema to database (2025-11-29)
- [x] Test database connection (2025-11-29)
- [x] Seed with Pre-Primer word list (2025-11-29)
- [x] Create 10 test sentences (2025-11-29)

#### Sentence Builder

- [x] Create WordCard component (2025-11-29)
- [x] Create Slot component (2025-11-29)
- [x] Implement tap-to-place interaction (2025-11-29)
- [x] Implement drag-and-drop (dnd-kit) (2025-11-29)
- [x] Word bank rendering (2025-11-29)
- [x] Slot state management (Zustand) (2025-11-29)

#### AI Validation

- [x] Set up OpenAI integration (2025-11-29)
- [x] Create validation prompt (2025-11-29)
- [x] Implement `/api/ai/validate-sentence` (2025-11-29)
- [x] Handle success/failure responses (2025-11-29)
- [x] Add loading state (2025-11-29)

#### Audio (TTS)

- [x] Set up OpenAI TTS (2025-11-29)
- [x] Create `/api/audio/[word]` route (2025-11-29)
- [x] Implement Vercel Blob storage (2025-11-29)
- [x] Create audio manager (HTML5 Audio) (2025-11-29)
- [x] Word playback on tap (2025-11-29)
- [x] Pre-generate audio for all 49 words (2025-11-29)
- [x] Sentence playback after correct submission (2025-11-29)
- [x] "Hear my sentence" preview button (2025-11-29)

#### Basic Admin

- [x] Simple word addition form (2025-11-29)
- [x] Sentence addition form (2025-11-29)
- [x] View all words/sentences (2025-11-29)

### Deliverables

- Playable sentence builder
- AI validation working
- Words speak when tapped
- Basic CRUD for content

---

## Phase 2: The "Juice" ✅

### Objective

Make the game feel polished and engaging.

### Tasks

#### Animations

- [x] Card tap animation (2025-11-29)
- [x] Card placement animation (2025-11-29)
- [x] Card return animation (2025-11-29)
- [x] Correct sentence glow (2025-11-29)
- [x] Incorrect sentence shake (2025-11-29)
- [x] Celebration confetti (2025-11-29)

#### Story Map

- [x] Map component (2025-11-29)
- [x] Node rendering (2025-11-29)
- [x] Path connections (2025-11-29)
- [x] Current position indicator (2025-11-29)
- [x] Locked/unlocked states (2025-11-29)
- [x] Navigation between nodes (2025-11-29)

> **Note**: StoryMap component built but requires route architecture changes to integrate (separate `/map` route). Currently play flow goes directly to mission.

#### Mission Flow

- [x] Mission intro screen (2025-11-29)
- [x] Narrative text display (2025-11-29)
- [ ] Character display *(deferred to Phase 4 - Themes)*
- [x] Transition animations (2025-11-29)
- [x] Mission complete screen (2025-11-29)
- [x] Star reveal animation (2025-11-29)

#### Hints

- [x] Hint button (2025-11-29)
- [x] Level 1: First word highlight (2025-11-29)
- [x] Level 2: Ghost words (2025-11-29)
- [x] Level 3: Audio playback (2025-11-29)
- [x] Hint cooldown (5 seconds) (2025-11-29)
- [x] Star impact (2025-11-29)
- [x] Auto-hint pulse after 15 sec inactivity (2025-11-29)
- [x] Auto-offer hint popup after 3 failed attempts (2025-11-29)

#### Feedback

- [x] Correct sound effect (2025-11-29)
- [x] Incorrect sound effect (2025-11-29)
- [ ] Voice phrases (TTS) *(deferred to Phase 4 - Themes)*
- [x] Progress indicator (2025-11-29)
- [x] Star calculation (2025-11-29)

#### Bug Fixes (GitHub Issues #1-4)

- [x] Click to remove words from slots - Issue #3 (2025-11-29)
- [x] Reorder visual feedback consistency - Issue #2 (2025-11-29)
- [x] Audio playback retry mechanism - Issue #1 (2025-11-29)
- [x] Responsive design for iPhone - Issue #4 (2025-11-29)

### Deliverables

- ✅ Complete mission flow
- ✅ Animated, satisfying interactions
- ✅ Story map navigation (component built)
- ✅ Working hint system

---

## Phase 3: AI & Admin ✅

> **Updated: 2025-11-30**
> Phase 3 largely complete. Dashboard shell, content management, and AI validation implemented.
> Player management and progress reports deferred to Phase 4 polish.

### Objective

Enable parents to manage content and track progress.

### Tasks

#### Dashboard Shell

- [x] Admin layout (2025-11-30)
- [x] Navigation menu (2025-11-30)
- [x] Parental gate (math problem) (2025-11-30)
- [ ] Session management *(deferred)*

#### Player Management

- [ ] Create player profile *(deferred to Phase 4)*
- [ ] Edit player *(deferred)*
- [ ] Switch players *(deferred)*
- [ ] Delete player *(deferred)*
- [ ] Player settings *(deferred)*

#### Progress Reports

- [ ] Word mastery visualization *(deferred to Phase 4)*
- [ ] Time played stats *(deferred)*
- [ ] Mission history *(deferred)*
- [ ] Struggling word alerts *(deferred)*
- [ ] Export to CSV *(deferred)*

#### AI Generators

- [x] Sentence generator API (2025-11-30)
- [x] Sentence validation with Zod and retry logic (2025-11-30)
- [ ] Sentence generator UI *(Phase 4)*
- [ ] Campaign generator UI *(Phase 4)*
- [ ] Campaign generator API *(Phase 4)*
- [ ] Preview and edit *(Phase 4)*
- [ ] Save to database *(Phase 4)*

#### Library Management

- [x] Word bank CRUD (2025-11-30)
- [x] Sentence bank CRUD (2025-11-30)
- [x] Audio regeneration scripts (2025-11-30)
- [x] Theme management (read-only) (2025-11-30)

### Deliverables

- ✅ Admin dashboard with parental gate
- ✅ Word and sentence management with adventure display
- ✅ AI sentence generation API with validation
- ⏳ Player management (Phase 4)
- ⏳ Progress reports (Phase 4)

---

## Phase 4: Themes & Polish 🔄

> **Updated: 2025-11-30**
> Expanded scope to include Theme Editor, Artwork System, and deferred Phase 3 items.
> See `phase-4-themes.md` for detailed task tracking.

### Objective

Ship-ready multi-theme experience with full admin editing capabilities.

### Tasks

#### Theme Engine (from Phase 2.5)

- [x] CSS variable system (2025-11-30)
- [x] Theme context/provider (2025-11-30)
- [x] Theme persistence (2025-11-30)
- [ ] Theme picker UI
- [ ] Per-theme progress tracking

#### Theme Editor (Admin) — NEW

- [ ] Theme list view with stats
- [ ] Theme editor (palette, characters, feedback)
- [ ] Campaign manager
- [ ] Mission editor with artwork
- [ ] Sentence assignment UI
- [ ] Asset uploader (Vercel Blob)
- [ ] Audio regeneration buttons
- [ ] Data validation warnings

#### Artwork System — NEW

- [ ] Schema migration (campaigns.artwork, missions.artwork)
- [ ] Artwork fallback logic helper
- [ ] MissionIntro artwork integration
- [ ] MissionComplete artwork integration

#### Paw Patrol (POC → Ship-Ready)

- [x] Theme seeded with palette, characters, phrases (2025-11-30)
- [x] 13 missions with 56 sentences (2025-11-30)
- [x] Feedback audio generation (2025-11-30)
- [x] Character word cards working (2025-11-30)
- [ ] Production character assets
- [ ] Mission artwork
- [ ] Boss celebration screen

#### Bluey Theme

- [ ] Theme record with palette
- [ ] Campaign design
- [ ] Seed script
- [ ] Feedback audio
- [ ] Character word cards
- [ ] QA playthrough

#### Marvel Theme

- [ ] Theme record with palette
- [ ] Campaign design
- [ ] Seed script
- [ ] Feedback audio
- [ ] Character word cards
- [ ] QA playthrough

#### Audio & Music

- [x] TTS pipeline (word audio, theme feedback) (2025-11-30)
- [x] Web Audio synth for UI sounds (2025-11-30)
- [ ] SFX pack per theme
- [ ] Background music
- [ ] Mute toggle UI
- [ ] Volume balancing

#### Testing & Accessibility

- [ ] Regression suite
- [ ] Accessibility pass
- [ ] Performance testing
- [ ] Bug fixes from playtests

### Deliverables

- Theme editor with full CRUD
- Artwork system with fallback chain
- Three playable themes
- Polished audio and accessibility

---

## Phase 5: Beyond

### Objective

Expand with mini-games and additional content.

### Tasks

#### Mini-Games

- [ ] Word Bingo implementation
- [ ] Memory Match implementation
- [ ] Whack-a-Word implementation
- [ ] Unlock conditions
- [ ] Integration with map

#### Additional Content

- [ ] Sticker collection UI
- [ ] More themes (Frozen, Mario, etc.)
- [ ] Custom theme wizard
- [ ] Additional word levels

#### Future Features

- [ ] Voice recognition for reading
- [ ] Multiplayer/sibling mode
- [ ] Print worksheets
- [ ] More mini-games

### Deliverables

- Three mini-games
- Expanded content library
- Foundation for future growth

---

← [Development](./README.md)

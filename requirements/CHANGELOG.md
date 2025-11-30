# Changelog

All notable changes to this project will be documented in this file.

This changelog focuses on human-readable summaries of significant changes, architectural decisions, and feature additions. For detailed commit history, see Git log.

---

## [Unreleased]

*Phase 2.5 (Theme POC) complete! Ready for Phase 3 (AI & Admin). See [Development Roadmap](./development/README.md) for details.*

---

## 2025-11-30

### Phase 2.5: Theme POC - Complete

Implemented the full Paw Patrol theme as proof-of-concept, validating the theme system architecture.

**Implemented (30/36 tasks - 83%):**

- **Theme Runtime System**
  - ThemeProvider with CSS variable injection (`src/lib/theme/ThemeContext.tsx`)
  - Theme persistence via localStorage
  - Theme loading states and error handling
  - Theme-aware component updates (WordCard, StoryMap, MissionIntro)

- **Database Seeding**
  - Schema migration: added `assets`, `characters`, `feedbackAudioUrls` to themes table
  - Added `unlockReward` to missions table
  - Created Paw Patrol theme with full palette and character data
  - Seeded 1 campaign, 13 missions, 56 sentences, 66 words
  - Created demo player with Paw Patrol campaign active

- **Character System**
  - CharacterWordCard component with gold border and portrait support
  - Character detection via `useIsCharacterWord` hook
  - Character vocabulary association in theme data

- **Story Map Integration**
  - Created `/map` route with MapClient component
  - StoryMap uses theme CSS variables for colors
  - Mission nodes with locked/unlocked/completed states

- **Campaign Flow APIs**
  - `/api/missions/[id]` - Fetch mission with theme, sentences, boss lock
  - `/api/progress` - GET/POST player progress, stars, unlocks
  - `/api/themes` and `/api/themes/[id]` - Theme listing and details

- **Audio Assets**
  - Generated 13 TTS audio files for feedback phrases (correct/encourage/celebrate)
  - Created `useThemeFeedback.ts` hook for audio playback
  - Audio stored in Vercel Blob, URLs in theme record

- **Admin Preview**
  - ThemeViewer component with color swatches, character list, feedback phrases
  - Campaign/mission/sentence hierarchy viewer
  - Added "Themes" tab to admin dashboard

**Files Created:**
- `src/lib/theme/ThemeContext.tsx` - Theme provider and hooks
- `src/lib/theme/index.ts` - Theme module exports
- `src/app/providers.tsx` - Client provider wrapper
- `src/components/game/CharacterWordCard.tsx` - Character card component
- `src/components/admin/ThemeViewer.tsx` - Admin theme viewer
- `src/app/map/page.tsx` and `MapClient.tsx` - Story map route
- `src/app/api/themes/route.ts` and `[id]/route.ts` - Theme APIs
- `src/app/api/missions/[id]/route.ts` - Mission API
- `src/app/api/progress/route.ts` - Progress API
- `src/app/api/admin/themes/route.ts` - Admin themes API
- `src/lib/audio/useThemeFeedback.ts` - Theme feedback audio hook
- `scripts/seed-paw-patrol.ts` - Paw Patrol data seeder
- `scripts/generate-theme-audio.ts` - TTS audio generator

**Deferred Tasks (6):**
- Unit tests for theme system
- Placeholder character image assets
- Progress persistence integration testing
- Campaign completion celebration screen
- Narrative audio generation (stretch goal)
- Data integrity indicators in admin

---

### Documentation

#### Phase 2.5: Theme POC Roadmap Created

Inserted a new development phase between Phase 2 (Juice) and Phase 3 (AI & Admin) to validate the theme system architecture before building AI content generation features.

**What:** Created comprehensive requirements for implementing the Paw Patrol theme as a proof-of-concept.

**Rationale:** The original roadmap jumped from animations/polish directly to AI content generation without validating that the theme system works. This creates risk because:
- AI generators produce theme-specific content, but the theme system doesn't exist yet
- Phase 4 commits to 3 themes without proving the architecture with one
- Admin features for theme management have nothing to manage

**Phase 2.5 Scope (34 tasks):**
- Theme runtime system (CSS variables, context provider, persistence)
- Database seeding (13 missions, ~55 sentences, Paw Patrol data)
- Character card system (special rendering for Chase, Marshall, etc.)
- Story map integration (real mission data, theme backgrounds)
- Campaign flow (map → intro → play → complete progression)
- Theme-specific audio (feedback phrases: "Paw-some!", etc.)
- Admin preview (read-only theme/campaign viewer)

**Exit Criteria:** Child can play through complete Paw Patrol campaign from story map to boss mission with themed visuals, narrative, and audio feedback.

**Files Created:**
- `requirements/development/phase-2.5-theme-poc.md` - Detailed phase requirements

**Files Updated:**
- `requirements/development/README.md` - Added Phase 2.5 to roadmap

**Why:** De-risks Phase 4 multi-theme rollout by proving architecture with one complete theme first. Provides real content for Phase 3 admin features to display.

---

## 2025-11-29 (Late Morning - Hardening)

- Sentence builder now tracks unique word card IDs so repeated words are supported and drag/drop IDs stay stable
- AI validation + TTS routes now validate inputs, cap payload sizes, and require configured API keys/blob tokens to reduce abuse risk
- Admin word/sentence update routes validate IDs, levels, and lengths to prevent bad data writes
- Added database env guards and a `.env.example` template to avoid leaking real secrets or running without configuration

---

## 2025-11-29 (Night Session - Code Review Fixes)

### Fixes

#### Code Review Improvements

Applied code quality improvements from Gemini code review.

**What Changed:**
- Added named constants for magic numbers in SentenceBuilder.tsx
  - `INACTIVITY_TIMEOUT_MS = 15000` (15 seconds before hint pulses)
  - `HINT_COOLDOWN_MS = 5000` (5 seconds between hint uses)
  - `RETRY_THRESHOLD = 3` (failed attempts before hint popup)
- Added setTimeout cleanup in MissionComplete.tsx (timeoutsRef with cleanup on unmount)
- All timers are now properly cleaned up to prevent memory leaks

**Why:** Code review identified potential memory leaks and magic numbers that reduce maintainability.

---

## 2025-11-29 (Night Session)

### Features

#### Phase 2 Completion: Auto-Hint System

Implemented the final missing Phase 2 requirements for the hint system.

**What Changed:**
- Added 5-second cooldown between hint uses (prevents spam)
- Added auto-hint pulse after 15 seconds of user inactivity
- Added "Would you like a little help?" popup after 3 failed attempts
- Hint button shows "Wait..." during cooldown period
- Inactivity timer resets on any user interaction (tap, drag, check)

**Implementation:**
- `hintCooldown` state with 5000ms timeout
- `hintPulsing` state triggered by inactivity timer
- `showHintPopup` state triggered by `retryCount >= 3`
- All timers properly cleaned up on unmount
- `resetInactivityTimer()` callback for unified timer management

**Why:** These features were specified in `requirements/gameplay/feedback-system.md` under Auto-Hint Triggers but were missing from the implementation.

**Phase 2 Status:** ✅ Complete! All core Phase 2 tasks finished.
- 2 items deferred to Phase 4: Character display and voice encouragement phrases

---

### Features

#### Audio Admin Sync System

On-demand generated audio files are now tracked in the database and visible in admin.

**What Changed:**
- `/api/audio/[word]` now creates word records for new words (level: "generated")
- New `/api/admin/sync-audio` API scans blob storage and syncs to database
- Admin dashboard shows "Sync Generated Audio" panel in Words tab
- Word table shows Level/Type column with color-coded badges:
  - `pre-primer` (green), `primer` (blue), `first-grade` (indigo)
  - `generated` (amber) - auto-created from on-demand TTS
  - `custom` (purple)

**Admin Sync Feature:**
- Shows count of blob files, already in DB, and newly added
- Lists all words that were synced
- Refreshes word list after sync completes

**Why:** Audio files generated on-demand (e.g., for sentence words not in sight word list) were being stored in blob but not tracked in database, making them invisible to admin.

---

## 2025-11-29 (Late Evening Session)

### Features

#### Phase 2 Component Integration

Integrated MissionIntro and MissionComplete components into the actual game flow.

**What Changed:**
- PlayClient.tsx now uses MissionIntro component for intro screen (was inline)
- PlayClient.tsx now uses MissionComplete component for completion screen (was inline)
- Added proper hint tracking from SentenceBuilder → PlayClient → MissionComplete
- Stars are now calculated dynamically based on hints used (was hardcoded)
- Added live star indicator in game header showing potential stars
- Exported MissionIntro, MissionComplete, StoryMap from components index

**Game Flow:**
```
MissionIntro → Playing (with live stars) → MissionComplete (with animated star reveal)
```

**Code Review:**
- Gemini review rated integration as "Good"
- Accessibility suggestions noted for future (ARIA roles for stars/progress)

**Why:** Components existed but weren't integrated into the actual game. Now the full mission flow works end-to-end.

---

## 2025-11-29 (Evening Session)

### Fixes

#### Hint System Overhaul

Improved the hint system based on user feedback.

**Changes:**
- Level 1: Now locks ONE word (doesn't follow to next word as slots fill)
- Level 2: Shows ghost words in all empty slots (was not working)
- Level 3: Plays sentence audio AND highlights ALL correct words
- Animation changed from pulsing glow to subtle shake pattern
- "Clear" button now resets all hint state

**Why:** Original hint behavior was confusing and level 2 wasn't functional.

---

### Fixes

#### GitHub Issue Fixes (#1-#4)

Addressed four user-reported issues:

**Issue #3 - Click to Remove Words from Slots:**
- Added onClick handler to `DraggableDroppableSlot`
- Clicking a placed word now returns it to the word bank
- Respects validation state (disabled when correct)
- Works alongside drag-and-drop (8px activation constraint prevents conflicts)

**Issue #2 - Reorder Visual Feedback:**
- Added custom transition config (200ms cubic-bezier easing)
- Cards now visually highlight when being dragged over during reorder
- Reduced touch sensor delay (150ms → 100ms) for more responsive feel
- Added z-index handling during drag operations

**Issue #1 - Audio Playback Fallback:**
- Added automatic retry mechanism (up to 2 retries on failure)
- Added preload setting for better audio buffering
- Added loading state tracking to `useWordAudio` hook
- Note: On-demand audio generation was already working

**Issue #4 - Responsive Design for iPhone:**
- Added responsive CSS utilities for viewport height breakpoints
- Word cards scale: 44px (mobile) → 52px (tablet) → 60px (desktop)
- Font sizes adapt from text-lg to text-2xl based on screen
- Buttons and padding use responsive Tailwind classes
- Added safe area insets for notched devices (env(safe-area-inset-*))
- Game container scales for landscape iPhone (max-height: 500px)

**Code Reviews:**
- Codex and Gemini code reviews confirmed the click-to-remove bug
- Gemini identified missing onClick handler on slots
- All fixes pass TypeScript checks

**Why:** User testing revealed interaction issues on various devices that needed addressing.

---

## 2025-11-29

### Features

#### Phase 2: The "Juice" - Core Features Complete (86%)

Added polish and "game feel" to make the experience engaging and satisfying.

**Animations Implemented:**
- Card tap animation with enhanced scale (0.9) and shadow effects
- Card placement with spring animations
- Correct answer pulsing glow (emerald)
- Incorrect answer shake with red outline
- Celebration confetti burst using canvas-confetti

**Mission Flow Components:**
- `MissionIntro.tsx` - Animated mission start screen with sentence count
- `MissionComplete.tsx` - Victory screen with animated star reveal
- `StoryMap.tsx` - Visual map with node types (play, treasure, minigame, boss)

**Hint System:**
- Progressive hint button (3 levels)
- Level 1: Pulsing amber highlight on correct word
- Level 2: Ghost words in slots (via scaffolding)
- Level 3: Full sentence audio playback

**Feedback System:**
- `useSoundEffects.ts` - Web Audio API sound generation
- `confetti.ts` - Celebration effect utilities
- `starCalculation.ts` - Star calculation (3 stars = no hints, 2 = 1 hint, 1 = 2+ hints)
- Progress indicator (X of Y sentences) with animated dots

**Dependencies Added:**
- `canvas-confetti` + `@types/canvas-confetti`

**Why:** Core gameplay was functional but lacked the "game feel" that makes it engaging for children. These additions make interactions satisfying and rewarding.

---

### Documentation

#### Development Phase Documentation Reorganized

Created individual phase tracking files for detailed progress management:

**Files Created:**
- `requirements/development/phase-1-engine.md` - Phase 1 detailed tracking (91% complete)
- `requirements/development/phase-2-juice.md` - Phase 2 planning (animations, story map)
- `requirements/development/phase-3-ai-admin.md` - Phase 3 planning (admin dashboard, AI generators)
- `requirements/development/phase-4-themes.md` - Phase 4 planning (three themes, audio polish)
- `requirements/development/phase-5-beyond.md` - Future features (mini-games, expansion)

**Files Updated:**
- `requirements/development/README.md` - Updated progress overview
- `requirements/development/phases.md` - Marked deployment complete, Basic Admin as current

**Why:** Enables better session continuity and more granular progress tracking per phase.

#### Audio Requirements Updated (Howler.js → HTML5 Audio)

Updated audio documentation to reflect the switch from Howler.js to native HTML5 Audio API using strikethrough notation for superseded content.

**Files Updated:**
- `requirements/audio/README.md` - Audio Playback library updated
- `requirements/audio/sound-design.md` - AudioManager examples marked superseded
- `requirements/audio/tts-integration.md` - Preloading example updated
- `CLAUDE.md` - Tech stack reference updated
- `README.md` - Tech stack table updated

**Why:** Simpler implementation without external dependency. Native Audio API provides sufficient functionality for our TTS-focused use case.

---

### Features

#### Basic Admin CRUD (Phase 1 Complete!)

Simple admin interface for managing words and sentences.

**Implementation:**
- Admin page at `/admin` with tabbed interface (Words / Sentences)
- Full CRUD API routes: `/api/admin/words`, `/api/admin/sentences`
- Word form: add new words with difficulty level selection
- Sentence form: add sentences with automatic word validation
- Input validation (length limits, type checking, distractor limits)
- Delete functionality for both words and sentences
- Link to admin from home page footer

**Files Created:**
- `src/app/admin/page.tsx` - Server component
- `src/app/admin/AdminClient.tsx` - Client component with forms and lists
- `src/app/api/admin/words/route.ts` - GET/POST words
- `src/app/api/admin/words/[id]/route.ts` - DELETE/PATCH word
- `src/app/api/admin/sentences/route.ts` - GET/POST sentences
- `src/app/api/admin/sentences/[id]/route.ts` - DELETE/PATCH sentence

**Code Reviews:**
- Gemini code review identified security recommendations (auth to be added in Phase 3)
- Added input validation based on review feedback

**Why:** Parents need a simple way to add custom words and sentences without database access.

**Phase 1 Status:** ✅ Complete! All Phase 1 tasks finished.

---

#### Sentence Audio Playback (Phase 1)

After correctly building a sentence, the child hears the full sentence read aloud to reinforce learning.

**Implementation:**
- Real-time OpenAI TTS (`tts-1` model, `nova` voice, 0.85x speed for comprehension)
- `/api/audio/sentence` POST endpoint for dynamic sentence audio
- `useSentenceAudio` React hook with blob URL handling
- Integrated into SentenceBuilder completion flow
- Plays the sentence the child *actually built* (not just the target)

**Files Created:**
- `src/app/api/audio/sentence/route.ts` - Sentence TTS endpoint
- `src/lib/audio/useSentenceAudio.ts` - React hook

**Why:** Hearing the completed sentence reinforces word recognition and provides satisfying feedback.

---

#### Full Drag-and-Drop System (Phase 1)

Complete drag-and-drop with full flexibility - move words anywhere!

**Supported Interactions:**
- **Word bank → Slot**: Drag word to place in specific slot
- **Slot → Slot**: Drag to swap/move words between slots
- **Slot → Word bank**: Drag back down to return word
- **Word bank reordering**: Drag to rearrange word order
- **Tap-to-place**: Quick tap still places in first empty slot

**Implementation:**
- @dnd-kit/core + @dnd-kit/sortable for full drag-and-drop
- `DraggableDroppableSlot` - slots are both drag sources AND drop targets
- `SortableWordCard` - word bank cards support reordering
- Droppable word bank area to return words
- Visual feedback: hover highlights, swap indicators (⇄)

**Store Updates:**
- `moveWordToSlot(from, to)` - swap words between slots
- `returnWordToBank(index)` - return word to bank
- `reorderWordBank(activeId, overId)` - reorder word bank

**Files Created/Updated:**
- `src/components/game/DraggableDroppableSlot.tsx` (new)
- `src/components/game/SortableWordCard.tsx` (new)
- `src/stores/sentenceStore.ts` (new actions)

**Why:** Full flexibility lets kids experiment and correct mistakes naturally.

---

#### "Hear My Sentence" Preview Button (Phase 1)

Added a "Hear my sentence" button that lets children hear their work-in-progress at any time.

**Implementation:**
- Button appears below sentence slots
- Disabled when no words placed, enabled when any word is in a slot
- Plays current words via real-time TTS (even partial/incorrect sentences)
- Shows animated "Playing..." state during playback

**Why:** Lets kids self-check their work before submitting - great for building reading intuition.

---

#### Audio/TTS System (Phase 1)

Words now speak when tapped using OpenAI TTS.

**Implementation:**
- OpenAI TTS (`tts-1` model, `nova` voice, 0.9x speed)
- Pre-generated audio for all 49 words stored in Vercel Blob
- `/api/audio/[word]` route with on-demand fallback and case-insensitive lookup
- Native HTML5 Audio API for simple, reliable playback
- `useWordAudio` React hook for easy integration

**Files Created:**
- `scripts/generate-audio.ts` - Batch audio generation
- `src/app/api/audio/[word]/route.ts` - Audio serving API
- `src/lib/audio/audioManager.ts` - Audio utilities
- `src/lib/audio/useWordAudio.ts` - React hook

**Cost:** ~$0.15 one-time for 49 words, then free (cached in Blob)

### Fixes

#### Case-Insensitive Word Audio Lookup

Fixed "I" word not playing audio. The word was stored as uppercase "I" in the database but the API was lowercasing to "i" for lookup.

**Solution:** Changed to case-insensitive SQL query: `LOWER(text) = LOWER(input)`

#### Simplified Audio Playback

Removed Howler.js complexity in favor of native HTML5 Audio API. This fixed issues where only the first word would play and subsequent words were silent.

**Why:** Simpler code is more reliable. Howler.js redirect handling was causing issues.

---

#### Sentence Builder Core (Phase 1)

The core sentence-building gameplay mechanic was implemented.

**Components Created:**
- `WordCard` - Animated word cards with press/selected states
- `Slot` - Sentence slots with ghost text scaffolding
- `SentenceBuilder` - Main component orchestrating tap-to-place interaction

**State Management:**
- Zustand store (`sentenceStore.ts`) for sentence builder state
- Word placement/removal logic
- Validation state tracking

**AI Validation:**
- `/api/ai/validate-sentence` endpoint using OpenAI GPT-4o-mini
- Flexible validation accepting semantically correct sentences
- Fallback to exact match if API fails

**Play Page:**
- Server component loading sentences from database
- Client component with mission intro/outro screens
- Progress tracking through sentences
- Celebration on mission completion

**Why:** Core gameplay loop needed for testing and iteration.

---

### Architecture

#### Project Initialization (Phase 1 - Project Setup)

The codebase was initialized with the core tech stack, ready for Vercel deployment.

**What was created:**
- Next.js 14.2 with App Router (`/src/app/`)
- TypeScript in strict mode
- Tailwind CSS with child-friendly theme extensions (touch targets, font sizes)
- Drizzle ORM with complete database schema
- ESLint configuration for Next.js

**Database Schema Includes:**
- `words` - Sight word storage with audio URLs
- `sentences` - Sentence templates with ordered words and distractors
- `missions` - Mission definitions with narratives
- `campaigns` - Campaign groupings
- `themes` - Theme configurations with palettes and feedback phrases
- `players` - Player profiles
- `missionProgress` - Mission completion tracking
- `wordMastery` - Per-word learning analytics
- `playerUnlocks` - Unlockable content tracking

**Files created:**
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript strict configuration
- `tailwind.config.ts` - Tailwind with custom child-friendly utilities
- `drizzle.config.ts` - Drizzle ORM configuration
- `src/lib/db/schema.ts` - Complete database schema
- `src/app/layout.tsx` - Root layout with landscape enforcement
- `src/app/page.tsx` - Placeholder home page
- `.env.example` - Required environment variables template

**Why:** Establish the foundation for Vercel deployment so the user can add Postgres and Blob integrations, enabling Phase 1 development to proceed.

**Status:** Build passes. Ready for Vercel deployment.

---

#### Database & Services Connected (Phase 1 - Infrastructure)

All external services were connected and verified working.

**Environment Variables (project-prefixed):**
- `SWG_POSTGRES_URL` - Prisma Postgres direct connection
- `SWG_PRISMA_DATABASE_URL` - Prisma Accelerate URL (optional)
- `SWG_READ_WRITE_TOKEN` - Vercel Blob storage
- `OPENAI_API_KEY` - OpenAI for TTS and validation

**Verified Working:**
- Prisma Postgres: Schema pushed, 9 tables created
- Vercel Blob: Upload/list/delete tested
- OpenAI Chat API: Sentence validation tested
- OpenAI TTS: Audio generation tested (8.6KB for "the")

**Test Scripts Created:**
- `scripts/check-db.ts` - List database tables
- `scripts/test-connection.ts` - Test Drizzle ORM CRUD
- `scripts/test-blob.ts` - Test Vercel Blob operations
- `scripts/test-openai.ts` - Test OpenAI Chat + TTS

**Why:** Verify all cloud services are properly configured before building game features.

---

### Documentation

#### Requirements Documentation Created

Comprehensive project requirements documentation was established, organizing all specifications into a navigable folder structure.

**What was created:**
- Master index at `/requirements/README.md`
- Project overview with personas, platforms, and philosophy
- Gameplay specifications (sentence builder, feedback, mini-games)
- Theme specifications (Paw Patrol, Bluey, Marvel, custom themes)
- Curriculum details (Dolch word lists, mastery tracking, adaptive difficulty)
- Progression system (story map, unlockables)
- UX design guidelines (principles, layouts, accessibility)
- Admin dashboard specs (content management, AI generators, reports)
- Audio system (TTS integration, sound design)
- Technical architecture (data models, API routes, AI integration)
- Development roadmap with 5 phases

**Why:** A single 1000+ line REQUIREMENTS.md was refactored into ~40 navigable files to improve maintainability and allow deeper specification per topic.

#### GitHub README Established

Created a best-in-class public-facing README.md with:
- Project overview and motivation
- Feature lists (for kids and parents)
- Complete tech stack with links
- Getting started guide
- Project structure documentation
- Links to detailed requirements
- Development phase roadmap

#### Claude Code Instructions Updated

Updated CLAUDE.md with workflow instructions:
1. Requirements-first development approach
2. Change protocol with strikethrough for superseded content
3. README maintenance responsibilities
4. Progress tracking in development folder
5. Changelog maintenance guidelines

---

## Format Guide

### Entry Structure

```markdown
## YYYY-MM-DD

### Category

#### Change Title

Brief description of what changed and why.

**What:** Specific details of the change
**Why:** Rationale or motivation
**Impact:** Any effects on other parts of the system
```

### Categories

- **Features** - New functionality
- **Changes** - Modifications to existing functionality
- **Fixes** - Bug fixes
- **Documentation** - Documentation updates
- **Architecture** - Structural or technical decisions
- **Requirements** - Changes to specifications
- **Removed** - Deprecated or removed features

---

← [Back to Index](./README.md)

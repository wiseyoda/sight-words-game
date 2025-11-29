# Changelog

All notable changes to this project will be documented in this file.

This changelog focuses on human-readable summaries of significant changes, architectural decisions, and feature additions. For detailed commit history, see Git log.

---

## [Unreleased]

*Phase 1 in progress. See [Development Roadmap](./development/README.md) for details.*

---

## 2025-11-29

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

# Changelog

All notable changes to this project will be documented in this file.

This changelog focuses on human-readable summaries of significant changes, architectural decisions, and feature additions. For detailed commit history, see Git log.

---

## [Unreleased]

*Phase 1 in progress. See [Development Roadmap](./development/README.md) for details.*

---

## 2025-11-29

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

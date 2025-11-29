# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Sight Words Adventure** - A premium educational game helping kindergarten children (ages 4-6) learn sight words through narrative-driven gameplay.

See [`/requirements/README.md`](./requirements/README.md) for comprehensive documentation.

---

## Critical Workflow Instructions

### 1. Requirements-First Development

**ALWAYS check changes against the written requirements before implementing:**

- Before writing code, read the relevant requirements file(s) in `/requirements/`
- Cross-reference your implementation against the documented specifications
- If requirements are ambiguous, ask the user for clarification before proceeding

**Key requirement areas:**
| Area | Location |
|------|----------|
| Gameplay mechanics | `/requirements/gameplay/` |
| Theme specifications | `/requirements/themes/` |
| Technical architecture | `/requirements/technical/` |
| Data models | `/requirements/technical/data-models.md` |
| API routes | `/requirements/technical/api-routes.md` |
| UX/Design | `/requirements/ux-design/` |

### 2. Requirements Change Protocol

**If you need to deviate from documented requirements:**

1. **DO NOT** silently change behavior that contradicts requirements
2. **DO** update the relevant requirements file with:
   - Current date/time
   - Reason for the change
   - Use ~~strikethrough~~ for superseded content (non-destructive)

**Example format:**
```markdown
### Original Requirement

~~The system shall use strict string matching for validation.~~

> **Updated: 2025-11-29 14:30**
> Changed to AI-powered validation for flexibility with word order.
> Reason: Strict matching was too rigid for natural sentence variations.

The system shall use LLM-powered validation that accepts semantically correct sentences.
```

### 3. README Maintenance

**Keep the GitHub README.md up to date:**

- Update after completing major features or phases
- Ensure the "Development Phases" status table reflects current progress
- Add screenshots/demos as they become available
- Update the project structure if it changes significantly

### 4. Progress Tracking

**Maintain development progress in `/requirements/development/`:**

- Update phase files (e.g., `phase-1-engine.md`) as tasks are completed
- Check off completed items: `- [x] Task completed`
- Add notes about implementation decisions or blockers
- This enables picking up where you left off across sessions

**Progress format:**
```markdown
- [x] Task completed (2025-11-29)
- [ ] Task in progress ← CURRENT
- [ ] Task not started
```

### 5. Changelog Maintenance

**Keep `/requirements/CHANGELOG.md` updated after major changes:**

- Log significant features, fixes, and architectural decisions
- Use human-readable summaries (not commit-style messages)
- Group by date and category
- Include rationale for important decisions

---

## Development Commands

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm lint         # Run ESLint
pnpm typecheck    # Run TypeScript checks
pnpm test         # Run tests
pnpm db:push      # Push schema to database
pnpm db:studio    # Open Drizzle Studio
pnpm db:seed      # Seed initial data
```

---

## Tech Stack Reference

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript (strict mode) |
| Database | Vercel Postgres |
| ORM | Drizzle ORM |
| State | Zustand + React Query |
| Animation | Framer Motion |
| Drag & Drop | dnd-kit |
| Audio | Howler.js |
| AI/LLM | Vercel AI SDK |
| TTS | OpenAI TTS API |

---

## MCP Tools

When using the Codex MCP tool, always use model `gpt-5.1-codex-max`.

When using Gemini MCP tools, prefer `gemini-3.0-pro-preview` if a model parameter becomes available. Currently the model is configured server-side.

---

## File Structure Conventions

```
/app
  /(game)           # Child-facing routes (no auth)
  /(admin)          # Parent dashboard (parental gate)
  /api              # API routes
/components
  /game             # Game-specific components
  /admin            # Dashboard components
  /ui               # Shared UI primitives
/lib
  /db               # Database schema and queries
  /ai               # AI prompts and utilities
  /audio            # Audio manager
/stores             # Zustand stores
/requirements       # Project documentation (source of truth)
```

---

## Key Design Principles

1. **Child-first UX** - Large touch targets (64px+), no reading required for navigation
2. **Encouragement only** - No "game over", no failure states, only "try again"
3. **AI-powered** - LLM validation, on-demand TTS, content generation
4. **Cloud-required** - No offline mode (simplifies architecture)
5. **Landscape tablet** - Primary target is iPad in landscape orientation

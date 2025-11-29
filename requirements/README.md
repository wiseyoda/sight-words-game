# Sight Words Game - Requirements

> A premium educational game helping kindergarten children (ages 4-6) learn sight words through narrative-driven gameplay.

**Version:** 3.0
**Last Updated:** November 29, 2025
**Status:** Ready for Development

---

## Quick Links

| Document | Description |
|----------|-------------|
| [Project Overview](./01-overview.md) | Purpose, audience, platforms, philosophy |
| [Gameplay](./gameplay/) | Core mechanics, sentence builder, mini-games |
| [Themes](./themes/) | Theme system, launch themes, custom themes |
| [Curriculum](./curriculum/) | Word lists, mastery tracking, adaptive difficulty |
| [Progression](./progression/) | Story map, unlockables, rewards |
| [UX Design](./ux-design/) | Design principles, layouts, accessibility |
| [Admin Dashboard](./admin-dashboard/) | Parent zone, AI generators, analytics |
| [Audio System](./audio/) | TTS, sound design, voice feedback |
| [Technical](./technical/) | Architecture, data models, APIs |
| [Development](./development/) | Roadmap, phases, task breakdowns |
| [Appendices](./appendices/) | Sample data, AI prompts, open items |
| [Changelog](./CHANGELOG.md) | History of significant changes |

---

## Core Philosophy

1. **"Premium Fun"** - High-fidelity animations, sound design, and "juicy" interactions
2. **"Narrative First"** - Learning unlocks the next part of the story
3. **"Infinite Content"** - AI-assisted generation means the game never runs out
4. **"Encouragement over Punishment"** - No "Game Over", only "Try Again" and "Great Job!"
5. **"Private & Familiar"** - Licensed characters for at-home play (not publicly distributed)
6. **"Cloud-Powered"** - Hosted on Vercel with LLM APIs for validation and content

---

## Target Experience

```
┌─────────────────────────────────────────────────────────────┐
│                      SESSION FLOW                           │
├─────────────────────────────────────────────────────────────┤
│  1. BRIEFING (5-10 sec)                                     │
│     → Animated cutscene sets the stage                      │
│     → "The bridge is broken! We need words to fix it!"      │
│                                                              │
│  2. ACTION PHASE (2-5 min)                                  │
│     → 3-5 sentence-building challenges                      │
│     → Immediate feedback per sentence                       │
│     → Visual progress (bridge building piece by piece)      │
│                                                              │
│  3. REWARD (5-10 sec)                                       │
│     → Celebration animation                                 │
│     → Stars earned (1-3 based on performance)               │
│     → Possible unlock (avatar, sticker)                     │
│                                                              │
│  4. MAP RETURN                                               │
│     → Progress to next node on Story Map                    │
│     → Option to continue or take a break                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript (strict mode) |
| Database | PostgreSQL (Vercel Postgres) |
| ORM | Drizzle ORM |
| State | Zustand + React Query |
| Animation | Framer Motion |
| Drag & Drop | dnd-kit |
| Audio | Howler.js |
| AI/LLM | Vercel AI SDK (OpenAI/Gemini) |
| TTS | OpenAI TTS API (on-demand) |
| Storage | Vercel Blob |
| Hosting | Vercel |

→ See [Technical Architecture](./technical/) for full details.

---

## Launch Themes (MVP)

| Theme | Description |
|-------|-------------|
| **Paw Patrol** | Adventure Bay Rescue - save friends with words |
| **Bluey** | Backyard Adventures - words unlock magical games |
| **Marvel Avengers** | Word Warriors - rebuild Infinity Words |

→ See [Themes](./themes/) for full specifications.

---

## Development Phases

| Phase | Focus | Duration |
|-------|-------|----------|
| 1 | The Engine | Weeks 1-2 |
| 2 | The "Juice" | Weeks 3-4 |
| 3 | AI & Admin | Weeks 5-6 |
| 4 | Themes & Polish | Weeks 7-8 |
| 5 | Mini-Games & Beyond | Post-Launch |

→ See [Development Roadmap](./development/) for detailed task breakdowns.

---

## Document Map

```
requirements/
├── README.md                    ← You are here
├── 01-overview.md               # Project overview
│
├── gameplay/
│   ├── README.md                # Gameplay overview
│   ├── core-loop.md             # Mission structure
│   ├── sentence-builder.md      # Building mechanics
│   ├── feedback-system.md       # Hints & feedback
│   └── mini-games.md            # Reinforcement games
│
├── themes/
│   ├── README.md                # Theme system
│   ├── paw-patrol.md            # Theme spec
│   ├── bluey.md                 # Theme spec
│   ├── marvel-avengers.md       # Theme spec
│   └── custom-themes.md         # AI-generated themes
│
├── curriculum/
│   ├── README.md                # Curriculum overview
│   ├── word-lists.md            # Dolch sight words
│   ├── mastery-tracking.md      # Progress algorithms
│   └── adaptive-difficulty.md   # Adaptation rules
│
├── progression/
│   ├── README.md                # Progression overview
│   ├── story-map.md             # Map navigation
│   └── unlockables.md           # Avatars, stickers, stars
│
├── ux-design/
│   ├── README.md                # UX overview
│   ├── design-principles.md     # Child-focused design
│   ├── screen-layouts.md        # All screens
│   ├── onboarding.md            # First-time experience
│   └── accessibility.md         # A11y requirements
│
├── admin-dashboard/
│   ├── README.md                # Dashboard overview
│   ├── content-management.md    # Library management
│   ├── ai-generators.md         # AI content tools
│   └── progress-reports.md      # Analytics
│
├── audio/
│   ├── README.md                # Audio overview
│   ├── tts-integration.md       # OpenAI TTS
│   └── sound-design.md          # SFX & music
│
├── technical/
│   ├── README.md                # Technical overview
│   ├── architecture.md          # Stack & structure
│   ├── data-models.md           # TypeScript types
│   ├── api-routes.md            # API specifications
│   ├── ai-integration.md        # LLM integration
│   └── performance.md           # Budgets & optimization
│
├── development/
│   ├── README.md                # Roadmap overview
│   ├── phase-1-engine.md        # Phase 1 tasks
│   ├── phase-2-juice.md         # Phase 2 tasks
│   ├── phase-3-ai-admin.md      # Phase 3 tasks
│   ├── phase-4-themes.md        # Phase 4 tasks
│   └── phase-5-beyond.md        # Future features
│
├── appendices/
│   ├── sample-data.md           # Example missions
│   ├── ai-prompts.md            # Prompt templates
│   └── open-items.md            # Decisions & TODOs
│
└── CHANGELOG.md                 # History of changes
```

---

## Key Decisions (Resolved)

| Decision | Resolution |
|----------|------------|
| Licensed IP | Acceptable for private/family use |
| Input method | Tap-to-place primary, drag secondary |
| Failure handling | No "game over", encouragement only |
| Sentence validation | AI-powered (LLM), not strict matching |
| Audio generation | On-demand via OpenAI TTS, cached |
| Offline support | None - cloud-powered, requires internet |

→ See [Open Items](./appendices/open-items.md) for pending decisions.

---

*This is the master index. Click any link above to dive deeper into specific areas.*

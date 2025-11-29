<div align="center">

# Sight Words Adventure

**A premium educational game helping kindergarten children learn sight words through narrative-driven gameplay**

[![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vercel](https://img.shields.io/badge/Vercel-deployed-black?style=flat-square&logo=vercel)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-Private-red?style=flat-square)](./LICENSE)

[Features](#features) • [Getting Started](#getting-started) • [Documentation](#documentation) • [Tech Stack](#tech-stack) • [Development](#development)

</div>

---

## Overview

Sight Words Adventure transforms the traditionally tedious task of learning sight words into an engaging, story-driven experience. Children aged 4-6 help their favorite characters solve problems by building sentences, progressing through themed campaigns while mastering the **Dolch Sight Words** - the 133 most common words that make up 50-75% of children's books.

### Why This Exists

- **Flashcards are boring** - Kids need games, not drills
- **Narrative creates meaning** - Words become tools to solve problems
- **AI enables infinite content** - Never run out of fresh challenges
- **Parents need visibility** - Track progress without hovering

### Target Experience

```
┌────────────────────────────────────────────────────────────────┐
│  1. BRIEFING           "The bridge is broken! Build words      │
│     → Character intro   to help Chase cross!"                  │
│                                                                │
│  2. ACTION PHASE       ┌─────┬─────┬─────┬─────┬─────┐        │
│     → Build sentences  │ The │ dog │ can │ run │  .  │        │
│     → Get feedback     └─────┴─────┴─────┴─────┴─────┘        │
│                                                                │
│  3. REWARD             ⭐⭐⭐ "Paw-some! You saved the day!"   │
│     → Stars earned                                             │
│     → Story continues                                          │
└────────────────────────────────────────────────────────────────┘
```

---

## Features

### For Kids

| Feature | Description |
|---------|-------------|
| **Sentence Builder** | Tap or drag words to build sentences |
| **Themed Adventures** | Paw Patrol, Bluey, Marvel, and custom themes |
| **Story Map** | Progress through narrative campaigns |
| **AI Validation** | Flexible sentence checking (not strict matching) |
| **Voice Feedback** | Words speak when tapped, sentences read aloud |
| **Hint System** | Progressive hints without punishment |
| **Unlockables** | Avatars, stickers, and celebrations |

### For Parents

| Feature | Description |
|---------|-------------|
| **Progress Dashboard** | Track word mastery and play time |
| **AI Content Generator** | Create custom missions from any topic |
| **Library Management** | Add words, review sentences |
| **Multiple Profiles** | Support for siblings |
| **Parental Gate** | Math problem keeps kids in game mode |

### Core Philosophy

1. **"Premium Fun"** - Feels like a real game, not educational software
2. **"Narrative First"** - Learning unlocks the next part of the story
3. **"Infinite Content"** - AI-assisted generation means fresh challenges
4. **"Encouragement Only"** - No "Game Over", only "Try Again!"
5. **"Cloud-Powered"** - LLM validation and on-demand TTS

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | [Next.js 14+](https://nextjs.org/) | App Router, Server Components |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | Type safety (strict mode) |
| **Database** | [Vercel Postgres](https://vercel.com/postgres) | Relational data storage |
| **ORM** | [Drizzle](https://orm.drizzle.team/) | Type-safe queries |
| **State** | [Zustand](https://zustand-demo.pmnd.rs/) | Client state management |
| **Animation** | [Framer Motion](https://www.framer.com/motion/) | Smooth, declarative animations |
| **Drag & Drop** | [dnd-kit](https://dndkit.com/) | Accessible, touch-friendly |
| **Audio** | [Howler.js](https://howlerjs.com/) | Cross-browser audio playback |
| **AI/LLM** | [Vercel AI SDK](https://sdk.vercel.ai/) | OpenAI/Gemini integration |
| **TTS** | [OpenAI TTS](https://platform.openai.com/docs/guides/text-to-speech) | On-demand voice generation |
| **Hosting** | [Vercel](https://vercel.com/) | Edge deployment, Blob storage |

---

## Getting Started

### Prerequisites

- **Node.js** 18.17+
- **pnpm** (recommended) or npm
- **Vercel account** (for Postgres and Blob storage)
- **OpenAI API key** (for TTS and validation)

### Installation

```bash
# Clone the repository
git clone https://github.com/wiseyoda/sight-words-game.git
cd sight-words-game

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Set up database
pnpm db:push
pnpm db:seed

# Start development server
pnpm dev
```

### Environment Variables

```bash
# .env.local
SWG_POSTGRES_URL=        # Prisma Postgres connection string (postgres://...)
SWG_READ_WRITE_TOKEN=    # Vercel Blob storage token
OPENAI_API_KEY=          # OpenAI API key for TTS and validation
```

---

## Project Structure

```
sight-words-game/
├── src/
│   ├── app/
│   │   ├── page.tsx             # Home page
│   │   ├── play/                # Gameplay route
│   │   │   ├── page.tsx         # Server component (loads data)
│   │   │   └── PlayClient.tsx   # Client component (game UI)
│   │   └── api/
│   │       └── ai/
│   │           └── validate-sentence/  # AI validation endpoint
│   ├── components/
│   │   └── game/                # WordCard, Slot, SentenceBuilder
│   ├── lib/
│   │   └── db/                  # Drizzle schema & queries
│   └── stores/                  # Zustand state stores
├── scripts/                     # Database utilities
├── requirements/                # Project documentation
└── public/                      # Static assets
```

---

## Documentation

Comprehensive requirements documentation is available in the [`/requirements`](./requirements/) folder:

| Section | Description |
|---------|-------------|
| [Overview](./requirements/01-overview.md) | Project purpose, audience, philosophy |
| [Gameplay](./requirements/gameplay/) | Core mechanics, sentence builder, feedback |
| [Themes](./requirements/themes/) | Paw Patrol, Bluey, Marvel, custom themes |
| [Curriculum](./requirements/curriculum/) | Dolch word lists, mastery tracking |
| [Progression](./requirements/progression/) | Story map, unlockables, rewards |
| [UX Design](./requirements/ux-design/) | Design principles, layouts, accessibility |
| [Admin Dashboard](./requirements/admin-dashboard/) | Parent features, AI generators |
| [Audio](./requirements/audio/) | TTS integration, sound design |
| [Technical](./requirements/technical/) | Architecture, data models, APIs |
| [Development](./requirements/development/) | Roadmap, phase breakdowns |

---

## Development

### Development Phases

| Phase | Focus | Status |
|-------|-------|--------|
| **1** | Core Engine - Sentence builder, AI validation, TTS | 🔄 In Progress |
| **2** | Polish - Animations, story map, feedback system | ⏳ Planned |
| **3** | AI & Admin - Dashboard, content generators | ⏳ Planned |
| **4** | Themes - Three launch themes, sound design | ⏳ Planned |
| **5** | Beyond - Mini-games, additional content | ⏳ Future |

### Phase 1 Progress

- [x] Project setup (Next.js, TypeScript, Tailwind)
- [x] Database schema and seeding (49 words, 10 sentences)
- [x] Sentence builder with tap-to-place
- [x] AI validation via OpenAI
- [x] TTS audio for words (Howler.js + OpenAI TTS)
- [ ] Drag-and-drop support
- [ ] Basic admin CRUD

### Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm typecheck    # Run TypeScript checks
pnpm test         # Run tests
pnpm db:push      # Push schema to database
pnpm db:studio    # Open Drizzle Studio
pnpm db:seed      # Seed with initial data
```

### Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Validation** | AI-powered (LLM) | Flexible word order, semantic understanding |
| **Input** | Tap-to-place primary | More intuitive for young children |
| **Audio** | On-demand TTS | No manual recording, infinite words |
| **Failure** | Encouragement only | No "game over", preserve confidence |
| **Offline** | Not supported | Simplifies architecture, requires AI |

---

## Target Platforms

### Primary: Tablets (Landscape)

- iPad (any size)
- Android tablets 8"+
- Fire HD tablets

### Secondary: Desktop Browsers

- Chrome 90+
- Safari 14+
- Firefox 88+
- Edge 90+

### Not Supported

- Phones (screen too small)
- Portrait orientation
- Legacy browsers

---

## Contributing

This is currently a private family project. The codebase uses licensed character IP (Paw Patrol, Bluey, Marvel) and is not intended for public distribution.

If the project is ever open-sourced, these themes would be replaced with original characters and full contribution guidelines would be provided.

---

## License

**Private Use Only**

This project contains references to licensed intellectual property (Paw Patrol, Bluey, Marvel) and is intended exclusively for private, non-commercial family use. Not for distribution.

---

## Acknowledgments

- **Dolch Word List** - The foundation of sight word curriculum
- **Duolingo** - Inspiration for gamification patterns
- **Our kindergartener** - The most important product tester

---

<div align="center">

**Built with love for curious young readers**

</div>

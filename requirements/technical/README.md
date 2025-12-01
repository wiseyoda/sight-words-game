# Technical Architecture

← [Back to Index](../README.md)

---

## Overview

Technical specifications for building the Sight Words Game on Next.js 16+ with Vercel deployment.

## Documents in This Section

| Document | Description |
|----------|-------------|
| [Architecture](./architecture.md) | Stack, structure, patterns |
| [Data Models](./data-models.md) | TypeScript types and schemas |
| [API Routes](./api-routes.md) | API specifications |
| [AI Integration](./ai-integration.md) | LLM configuration |
| [Performance](./performance.md) | Budgets and optimization |

---

## Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Framework** | Next.js 16+ (App Router) | Server Actions, RSC, Vercel |
| **Language** | TypeScript (strict) | Type safety |
| **Styling** | Tailwind CSS | Rapid development |
| **Animation** | Framer Motion | Declarative, performant |
| **Database** | Vercel Postgres | Relational, integrated |
| **ORM** | Drizzle ORM | Type-safe, lightweight |
| **State** | Zustand | Simple, performant |
| **Data Fetching** | React Query | Caching, revalidation |
| **Drag & Drop** | dnd-kit | Accessible, touch-friendly |
| **Audio** | Howler.js | Cross-browser, sprites |
| **AI/LLM** | Vercel AI SDK | Streaming, validation |
| **TTS** | OpenAI TTS API | On-demand audio |
| **Storage** | Vercel Blob | Audio file storage |
| **Auth** | NextAuth.js | Passcode flow |
| **Testing** | Vitest + RTL | Fast, good DX |

---

## Project Structure

```
/app
  /(game)                    # Child-facing routes
    /page.tsx               # Main menu
    /play/[themeId]/page.tsx # Story map
    /mission/[missionId]/page.tsx # Gameplay
    /mini-games/[gameId]/page.tsx
    /stickers/page.tsx
    /avatars/page.tsx
  /(admin)                   # Parent dashboard
    /layout.tsx             # Auth wrapper
    /dashboard/page.tsx
    /generator/page.tsx
    /library/page.tsx
    /progress/page.tsx
    /settings/page.tsx
  /api
    /ai/validate-sentence/route.ts
    /ai/generate-sentences/route.ts
    /ai/generate-audio/route.ts
    /ai/generate-campaign/route.ts
    /audio/[wordId]/route.ts
    /progress/route.ts
/components
  /game                     # GameBoard, WordCard, Slot
  /admin                    # Dashboard components
  /ui                       # Shared UI components
/lib
  /db                       # Drizzle schema, queries
  /audio                    # Audio manager
  /ai                       # AI prompts, parsers
  /game                     # Game state logic
/stores                     # Zustand stores
/public
  /audio/sfx                # Static sound effects
  /images/themes
  /images/avatars
```

---

## Key Patterns

### Server Components (Default)

```tsx
// /app/(game)/page.tsx
export default async function MainMenu() {
  const player = await getCurrentPlayer();
  const themes = await getActiveThemes();

  return <MainMenuClient player={player} themes={themes} />;
}
```

### Client Components (Interactive)

```tsx
'use client';

// /components/game/SentenceBuilder.tsx
export function SentenceBuilder({ words, sentence }: Props) {
  const [placedWords, setPlacedWords] = useState<Word[]>([]);
  // Interactive logic
}
```

### Server Actions (Mutations)

```typescript
'use server';

// /lib/actions/progress.ts
export async function saveMissionProgress(
  playerId: string,
  missionId: string,
  stars: number
) {
  await db.insert(missionProgress).values({ playerId, missionId, stars });
  revalidatePath('/play');
}
```

---

## Network Requirements

> **Cloud-powered application.** Requires internet.

### Required Connections

| Feature | Endpoint | Frequency |
|---------|----------|-----------|
| Sentence validation | `/api/ai/validate-sentence` | Per submission |
| Audio | Vercel Blob CDN | Per word |
| Progress save | Vercel Postgres | Per mission |
| Content generation | `/api/ai/generate-*` | Admin only |

### No Offline Mode

If offline, show friendly message:
> "Oops! We need internet to play. Let's try again when we're connected!"

---

← [Back to Index](../README.md) | [Architecture →](./architecture.md)

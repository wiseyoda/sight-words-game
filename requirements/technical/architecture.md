# Architecture

← [Back to Technical](./README.md)

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        VERCEL                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Next.js   │  │   Vercel    │  │   Vercel    │         │
│  │   App       │  │   Postgres  │  │   Blob      │         │
│  │   (Edge)    │  │   (DB)      │  │   (Audio)   │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                │                │                  │
│         └────────────────┴────────────────┘                  │
│                          │                                   │
│                   ┌──────┴──────┐                           │
│                   │   OpenAI    │                           │
│                   │   (AI/TTS)  │                           │
│                   └─────────────┘                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Request Flow

### Game Screen Load

```
Browser → Next.js → RSC renders with DB data → HTML/JSON → Client hydrates
```

### Sentence Validation

```
Submit → /api/ai/validate-sentence → OpenAI API → JSON response → UI update
```

### Audio Playback

```
Word tap → Check Howler cache → Miss → Fetch from Blob CDN → Play
```

---

## State Management

### Server State (React Query)

```typescript
// Player progress, missions, words
const { data: progress } = useQuery({
  queryKey: ['progress', playerId],
  queryFn: () => fetchProgress(playerId),
});
```

### Client State (Zustand)

```typescript
// Game state, UI state
const useGameStore = create<GameState>((set) => ({
  placedWords: [],
  currentSentence: 0,
  hintsUsed: 0,
  placeWord: (word) => set((s) => ({
    placedWords: [...s.placedWords, word]
  })),
}));
```

---

## Rendering Strategy

| Route | Strategy | Reason |
|-------|----------|--------|
| Main Menu | Static + Client | Fast load |
| Story Map | SSR | Dynamic progress |
| Gameplay | Client | Highly interactive |
| Admin | SSR | Data-heavy |

---

## Caching

| Layer | Strategy | TTL |
|-------|----------|-----|
| Browser | Service Worker | 1 day |
| CDN | Vercel Edge | 1 year (audio) |
| React Query | Stale-while-revalidate | 5 min |
| Database | Connection pooling | - |

---

← [Technical](./README.md)

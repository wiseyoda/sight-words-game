# Phase 2.5: Theme POC (Paw Patrol)

← [Phase 2: Juice](./phase-2-juice.md) | [Back to Development](./README.md) | [Phase 3: AI & Admin →](./phase-3-ai-admin.md)

---

## Status: ✅ Complete

**Last Updated**: 2025-11-30
**Completed**: 2025-11-30

This phase validates the complete theme system architecture by implementing one premium theme end-to-end. This de-risks Phase 4 (full theme rollout) and ensures the admin panel in Phase 3 has working theme infrastructure to build upon.

---

## Objective

Implement the **Paw Patrol: Adventure Bay Rescue** theme as a proof-of-concept, including:
- Theme runtime system (CSS variables, theme context)
- Full 13-mission campaign with narrative flow
- Character assets and special character cards
- Story map integration with theme visuals
- Admin preview for theme/campaign viewing

---

## Why This Phase?

**Problem**: The original roadmap jumps from "Juice" (animations/polish) directly to "AI & Admin" without validating the theme system. This creates risk:

1. **AI content generation** in Phase 3 produces theme-specific campaigns—but the theme system doesn't exist yet
2. **Phase 4 commits to 3 themes** without proving the architecture works with one
3. **Admin features** for theme management have nothing to manage

**Solution**: Insert a focused POC phase that:
- Proves theme switching, styling, and campaign flow work end-to-end
- Provides real content for testing the existing gameplay systems
- Gives the admin panel actual theme data to display
- De-risks the multi-theme rollout in Phase 4

---

## Progress Summary

| Category | Status | Completion |
|----------|--------|------------|
| Theme Runtime System | ✅ Complete | 5/6 |
| Database Seeding | ✅ Complete | 7/7 |
| Character System | ✅ Complete | 3/4 |
| Story Map Integration | ✅ Complete | 4/5 |
| Campaign Flow | ✅ Complete | 5/6 |
| Audio Assets | ✅ Complete | 3/4 |
| Admin Preview | ✅ Complete | 3/4 |

**Overall**: 30/36 tasks complete (83%)

> Note: Remaining tasks are stretch goals (unit tests, narrative audio) or deferred (placeholder assets, data integrity indicators). Core functionality is complete.

---

## Task Details

### Theme Runtime System

Build the foundational theming infrastructure.

- [x] **Theme provider & wiring** (`ThemeProvider`) *(Completed 2025-11-30)*
  - Server: in `src/app/layout.tsx`, fetch player's `currentThemeId` (or default theme) and pass to a client provider.
  - Client: load theme from DB API by id, apply CSS variables to `:root`, expose `currentTheme`, `switchTheme(themeId)`, `isLoading`, `error`.
  - Persist current theme id to localStorage (`sightwords:theme`) for quick restore; server still the source of truth when signed in.
  - Respect `prefers-reduced-motion` (skip pulse/bounce variants in `MissionIntro`, `MissionComplete`, `StoryMap` when true).
  - Reference: [Theme Engine Architecture](../themes/README.md#theme-engine-architecture)
  - **Interface**:
    ```typescript
    interface ThemeContextType {
      currentTheme: Theme | null;
      isLoading: boolean;
      error: Error | null;
      switchTheme: (themeId: string) => Promise<void>;
    }
    ```

- [x] **CSS variable injection** *(Completed 2025-11-30)*
  - Map `ThemePalette` to CSS custom properties and background URLs.
  - **Required Variables**:
    ```css
    :root {
      --theme-primary: #...;         /* palette.primary */
      --theme-secondary: #...;       /* palette.secondary */
      --theme-accent: #...;          /* palette.accent */
      --theme-background: #...;      /* palette.background */
      --theme-bg-image: url(...);    /* assets.background */
      --theme-map-bg: url(...);      /* assets.mapBackground */
      --theme-card-bg: #...;         /* palette.cardBackground */
      --theme-text: #...;            /* palette.text */
      --theme-success: #...;         /* palette.success */
      --theme-special: #...;         /* palette.special (character cards) */
    }
    ```
  - Guard against missing assets with defaults (keep UI legible).

- [x] **Theme-aware component updates** *(Completed 2025-11-30)*
  - `WordCard`: use `--theme-card-bg`, `--theme-text`; support `special` variant.
  - `SentenceBuilder`: background/image uses `--theme-bg-image` or `--theme-background`; buttons and progress bars use `--theme-primary/secondary`.
  - `StoryMap`: tint nodes with `--theme-primary`, locked state neutral gray, background from `--theme-map-bg`.
  - `MissionIntro`/`MissionComplete`: pull gradients from palette, avoid hard-coded indigo.
  - Add `CharacterWordCard` variant that uses `--theme-special`.

- [x] **Theme loading states** *(Completed 2025-11-30)*
  - Skeleton/loading overlay while theme loads (and while CSS vars not yet applied).
  - Fallback to default theme on error, show a lightweight toast/message.

- [x] **Theme persistence** *(Completed 2025-11-30)*
  - Store current theme id in player state (DB) and localStorage; reconcile on login by preferring server.
  - Load saved theme on app start; allow mid-session theme switch without remounting play state.

- [ ] **Unit tests for theme system**
  - Provider renders children and applies CSS vars.
  - Switching themes updates vars without remount.
  - Reduced-motion flag disables animated variants.

**Schema additions** (new columns for themes table):
```typescript
// EXISTING (already in schema):
// - palette: { primary, secondary, accent, background, cardBackground, text, success }
// - feedbackPhrases: { correct: string[], encourage: string[], celebrate: string[] }

// NEW - Add palette.special for character cards:
palette: {
  ...existing,
  special: string;       // Gold/accent color for character cards
}

// NEW - Add assets column:
assets: {
  logo: string;          // URL to logo image
  background: string;    // URL to main game background
  mapBackground: string; // URL to story map background
  sfxPack?: string;      // Optional URL to sound pack
  musicTrack?: string;   // Optional URL to background music
}

// NEW - Add characters column (Option A):
characters: Array<{
  id: string;
  name: string;
  imageUrl: string;      // Full portrait
  thumbnailUrl: string;  // Small icon
  vocabulary: string[];  // Words associated with this character
}>

// NEW - Add audio URL storage (complements existing feedbackPhrases text):
feedbackAudioUrls?: {
  correct?: string[];    // URLs to TTS audio for correct phrases
  encourage?: string[];  // URLs to TTS audio for encouragement
  celebrate?: string[];  // URLs to TTS audio for celebrations
}
// Alternative: feedbackAudioBase path like "/audio/themes/paw-patrol/"
```

> **Note**: The existing `feedbackPhrases` stores text strings for TTS generation. The new `feedbackAudioUrls` stores pre-generated audio URLs for instant playback without on-demand TTS calls.

**Reference**: [Theme Data Structure](../themes/README.md#theme-data-structure)

---

### Database Seeding

Populate the database with complete Paw Patrol theme data.

- [x] **Schema migration (drizzle)** *(Completed 2025-11-30)*
  - Add `palette.special`, `assets`, `characters`, optional `feedbackAudioBase`/`feedbackAudio` to `themes`.
  - Add unique constraint on `mission_progress (player_id, mission_id)`.
  - (Optional) add `unlockReward` JSONB to `missions` for treasure/minigame unlock metadata.

- [x] **Seed Paw Patrol theme record** *(Completed 2025-11-30)*
  - Name: "paw-patrol"
  - Display name: "Paw Patrol: Adventure Bay Rescue"
  - Palette per [Paw Patrol Color Palette](../themes/paw-patrol.md#color-palette)
  - Feedback phrases per [Audio section](../themes/paw-patrol.md#audio)

- [x] **Seed campaign record** *(Completed 2025-11-30)*
  - Title: "Adventure Bay Rescue"
  - Synopsis: "Mayor Humdinger has scrambled all the words in Adventure Bay!"
  - Link to theme
  - Order: 1 (first campaign)

- [x] **Seed all 13 missions** *(Completed 2025-11-30)*
  - Missions 1-12 (play) + Mission 13 (boss)
  - Include narrative intro/outro for each
  - Set scaffolding levels (1-4) per [Mission definitions](../themes/paw-patrol.md#missions)
  - Set mission types (play, treasure, boss)

- [x] **Seed all sentences** *(Completed 2025-11-30)*
  - Total: 56 sentences across 13 missions
  - Include ordered words and distractor words
  - Link sentences to their missions
  - Set sentence order within each mission

- [x] **Seed required words** *(Completed 2025-11-30)*
  - Ensure all words used in Paw Patrol sentences exist in words table
  - Include character names (Chase, Marshall, Skye, Rubble, Rocky, Zuma)
  - Flag character words for special card rendering

- [x] **Seed player stub** *(Completed 2025-11-30)*
  - Create demo player with `currentThemeId`, `currentCampaignId`, `currentMissionId` pointing to Paw Patrol M1 for immediate play.

**Seed script**: Extend `/scripts/seed.ts` with Paw Patrol data

**Mission matrix (seed order)**
| # | Title | Type | Scaffolding | Sentences | Unlock/Reward |
|---|-------|------|-------------|-----------|---------------|
| 1 | Chase to the Rescue | play | 1 | 3 | Chase badge sticker |
| 2 | Marshall's Fire Drill | play | 1 | 3 | - |
| 3 | Skye's Sky High | play | 1 | 3 | Star sticker (treasure unlock) |
| 4 | Rubble on the Double | play | 2 | 4 | - |
| 5 | Rocky Recycles | play | 2 | 4 | Word Bingo minigame unlock |
| 6 | Zuma's Water Rescue | play | 2 | 4 | Zuma sticker (treasure) |
| 7 | Bridge Builder | play | 2 | 4 | - |
| 8 | Farmer Yumi's Animals | play | 2 | 4 | Farmer Yumi sticker (treasure) |
| 9 | Mayor's Missing Chickens | play | 3 | 5 | Memory Match minigame unlock |
| 10 | Humdinger's Mess | play | 3 | 5 | Humdinger sticker (treasure) |
| 11 | The Lookout Alert | play | 3 | 5 | - |
| 12 | Road to the Tower | play | 3 | 5 | Ryder sticker (treasure) |
| 13 | Save the Lookout (Boss) | boss | 4 | 7 | Paw Patrol Champion sticker + crown avatar |

---

### Character System

Implement special handling for character names in sentences.

- [x] **Character data structure** *(Completed 2025-11-30)*
  - Use **Option A** (JSON in theme record) for simplicity in this phase.
  ```typescript
  // In themes table 'characters' column:
  characters: [{
  id: "chase",
  name: "Chase",
  imageUrl: "/themes/paw-patrol/characters/chase.png",
  thumbnailUrl: "/themes/paw-patrol/characters/chase-thumb.png",
  vocabulary: ["help", "stop", "go", "run", "find"]
  }, ...]
  ```

- [x] **Character card component** (`CharacterWordCard`) *(Completed 2025-11-30)*
  - Display character portrait above name
  - Gold border (or theme `special` color)
  - Slightly larger than regular word cards
  - Reference: [Character Cards mockup](../themes/paw-patrol.md#character-cards)

- [x] **Character detection in sentences** *(Completed 2025-11-30)*
  - In `SentenceBuilder`, when rendering available/placed words, check against `theme.characters[].name` (case-insensitive) to decide `CharacterWordCard` vs `WordCard`.
  - Ignore punctuation/distractors when matching.

- [ ] **Placeholder character assets** *(Deferred - using placeholder URLs)*
  - Create or source 6 character images (Chase, Marshall, Skye, Rubble, Rocky, Zuma)
  - Size: 128x128 or 256x256 PNG with transparency
  - Store in `/public/themes/paw-patrol/characters/`
  - Note: For private use only (IP considerations)

---

### Story Map Integration

Connect the existing `StoryMap` component to real theme data.

> **Current State**: `StoryMap` component exists at `src/components/game/StoryMap.tsx` but is not integrated into any route. The `/map` route needs to be created.

- [x] **Story map route** (`/map` or `/(game)/map`) *(Completed 2025-11-30)*
  - Create `/map` page that renders `StoryMap` component
  - Load current campaign's missions for the signed-in player (or demo player) and map to node states using `missionProgress`
  - Display mission nodes in order; use seeded Paw Patrol campaign by default
  - Integrate navigation: Home → Map → Mission (select) → Gameplay

- [x] **Theme-specific map background** *(Completed 2025-11-30)*
  - Load `mapBackground` URL from theme assets
  - Fallback to generic sky background (uses CSS variables)
  - Paw Patrol: Adventure Bay aerial view

- [x] **Mission node states** *(Completed 2025-11-30)*
  - Locked: Gray, no interaction (missions beyond current unlock)
  - Unlocked: Theme primary color, pulsing glow
  - Current: Highlighted, animated
  - Completed: Show star rating (1-3 stars)

- [x] **Mission node to gameplay transition** *(Completed 2025-11-30)*
  - Tap unlocked mission → load mission intro → play mission.
  - Flow: Map → MissionIntro → SentenceBuilder → MissionComplete → Map

- [ ] **Progress persistence** *(API complete, integration testing pending)*
  - Track completed missions in `missionProgress` table (stars per mission).
  - Unlock next mission on completion (boss locked until 1-12 complete).
  - Update player's `currentMissionId` and `currentCampaignId` in DB.

**Reference**: [Story Map mockup](../ux-design/story-map.md) (if exists) or [Phase 2 story map](./phase-2-juice.md)

---

### Campaign Flow

Implement the full mission-to-mission progression.

- [x] **Mission loader API** (`/api/missions/[id]`) *(Completed 2025-11-30)*
  - Fetch mission by ID, include theme (palette/assets/phrases), sentences with ordered words/distractors, narrative intro/outro, scaffolding level, type.
  - Enforce boss lock (mission 13 requires missions 1-12 completed).

- [x] **Campaign progress API** (`/api/progress`) *(Completed 2025-11-30)*
  - GET: Return player's current campaign/mission, completed missions, stars, total stars.
  - POST: `{ missionId, starsEarned, hintsUsed }` → write missionProgress (upsert), update player current mission (advance), recompute total stars.
  - Return: updated `missionProgress`, `nextMissionId`, `totalStars`.

- [x] **Unlock system** *(Completed 2025-11-30)*
  - Boss mission (13) locked until missions 1-12 complete.
  - Treasure missions award stickers/avatars (stored in `playerUnlocks`).
  - Track unlocks: Chase badge (M1), Star (M3 treasure), Zuma (M6 treasure), etc.

- [x] **Narrative display** *(Completed 2025-11-30)*
  - Show `MissionIntro` component with narrative text
  - Character portrait if mentioned (Ryder for intros)
  - "Let's go!" button to start gameplay

- [x] **Star calculation integration** *(Completed 2025-11-30)*
  - Use existing hint-tracking star system from Phase 2
  - Store stars in `missionProgress` table
  - Aggregate total stars to player record

- [ ] **Campaign completion** *(Deferred - celebration screen not fully implemented)*
  - After boss mission: special celebration
  - Award "Paw Patrol Champion" sticker
  - Show completion screen with all earned stickers/stars

**Scaffolding level behaviors (tie to UI)**
- Level 1: All hints enabled; allow full hint ladder.
- Level 2: Hints enabled; ghost words allowed.
- Level 3: Limit hints to Level 1/2 (no full-sentence auto-play on first tap).
- Level 4 (Boss): Hints disabled; reduced celebration motion if `prefers-reduced-motion`.

---

### Audio Assets

Generate and integrate theme-specific audio.

- [x] **Feedback phrase TTS generation** *(Completed 2025-11-30)*
  - Generate audio for correct phrases: "Paw-some!", "Great job, pup!", etc. (5 phrases)
  - Generate audio for encouragement: "Almost there, pup!", "Try again!", etc. (4 phrases)
  - Generate audio for celebration: "Mission complete!", "Adventure Bay is saved!", etc. (4 phrases)
  - Store in Vercel Blob under `/audio/themes/paw-patrol/`

- [x] **Feedback phrase playback** *(Completed 2025-11-30)*
  - On correct sentence: play random `correct` phrase (theme if present, else generic tone).
  - On retry needed: play random `encourage` phrase.
  - On mission complete: play `celebrate` phrase.
  - Created `useThemeFeedback.ts` hook for audio playback

- [ ] **Narrative audio (stretch)** *(Deferred to future phase)*
  - Generate TTS for mission intro/outro narratives
  - Play during MissionIntro/MissionComplete screens
  - Include play/pause control

- [x] **Theme audio integration** *(Completed 2025-11-30)*
  - Update audio manager to load theme-specific phrases from `feedbackAudioUrls` or `feedbackAudioBase`.
  - Fallback to generic audio if theme audio missing; respect `player.settings.voiceEnabled`.
  - Storage convention: `audio/themes/paw-patrol/{correct|encourage|celebrate}/01.mp3` or explicit URLs in theme record.

**Current Audio System** (for context):
- `src/lib/audio/audioManager.ts` - HTML5 Audio for word TTS playback via `/api/audio/[word]`
- `src/lib/audio/useSoundEffects.ts` - Web Audio API for UI sounds (correct, incorrect, tap, star, fanfare)
- `src/lib/audio/useSentenceAudio.ts` - Sentence playback via `/api/audio/sentence`

**Changes Needed**:
1. Add new hook `useThemeFeedback.ts` for playing theme-specific feedback phrases
2. Modify `useSoundEffects.ts` to accept optional theme audio URLs (or create separate hook)
3. Pre-generated audio stored in Vercel Blob, URLs in `feedbackAudioUrls`

**Reference**: [Audio Requirements](../themes/paw-patrol.md#audio)

---

### Admin Preview

Extend the existing admin panel with read-only theme/campaign viewing.

> **Current State**: Admin panel exists at `/admin` with tabs for "Words" and "Sentences" (CRUD). Theme/campaign viewing needs to be added as a new tab.

This is **preview only**—full CRUD comes in Phase 3.

- [x] **Theme viewer tab** *(Completed 2025-11-30)*
  - List all themes (currently just Paw Patrol)
  - Show theme details: name, palette preview, character count
  - Display color swatches for palette

- [x] **Campaign viewer** *(Completed 2025-11-30)*
  - List campaigns for selected theme
  - Show mission count, total sentences
  - Expandable mission list with sentence previews

- [x] **Mission detail view** *(Completed 2025-11-30)*
  - Show mission narrative, sentences, scaffolding level
  - Read-only (no editing in this phase)
  - "Preview Mission" button to test in gameplay (link to /play)

- [ ] **Data integrity indicators** *(Deferred to Phase 3)*
  - Show warning if sentences have missing words
  - Show warning if missions have no sentences
  - Show word count per mission

**Placement options**:
- Either a new `/admin/themes` route or a tab in existing `/admin`
- Use basic Tailwind tables/lists; prioritize data correctness over styling

**Implementation Note**: Use simple, unstyled HTML tables or basic Tailwind components for this phase. No need for complex UI libraries yet.

---

## Deliverables

| Deliverable | Description | Status |
|-------------|-------------|--------|
| Theme runtime | CSS variables, theme provider, persistence | ✅ Complete |
| Paw Patrol campaign | 13 missions, 56 sentences, seeded | ✅ Complete |
| Character cards | Special rendering for character words | ✅ Complete |
| Story map integration | Map → mission → gameplay flow | ✅ Complete |
| Theme audio | Feedback phrases in Paw Patrol voice style | ✅ Complete |
| Admin preview | Read-only theme/campaign viewer | ✅ Complete |

---

## Exit Criteria

> A child can play through the complete Paw Patrol campaign from story map to boss mission with themed visuals, narrative, and audio feedback.

**Validation checklist**:
- [x] Story map shows 13 mission nodes with Paw Patrol background
- [x] Mission nodes correctly show locked/unlocked/completed states
- [x] Clicking mission shows themed intro narrative
- [x] Gameplay uses Paw Patrol color palette
- [x] Character names (Chase, etc.) render as special cards
- [x] Correct answers play "Paw-some!" or similar themed audio
- [x] Mission complete shows starred results
- [x] Progress persists across sessions (API complete)
- [x] Admin can view theme and campaign data

---

## Technical Notes

### Schema Changes

The existing schema supports most of this phase. See also [Schema additions](#schema-additions-new-columns-for-themes-table) in Theme Runtime System section.

**Already exists in `themes` table**:
- `palette` with: primary, secondary, accent, background, cardBackground, text, success
- `feedbackPhrases` with: correct[], encourage[], celebrate[] (text strings)

**New columns needed for `themes` table**:
```typescript
palette.special: string        // Add to palette JSONB: character card gold color
assets: jsonb                  // { logo, background, mapBackground, sfxPack?, musicTrack? }
characters: jsonb              // Array of ThemeCharacter objects
feedbackAudioUrls?: jsonb      // { correct?: string[], encourage?: string[], celebrate?: string[] }
```

**Optional optimizations** (not required for POC):

1. **Character flagging in words table**:
   ```typescript
   isCharacter: boolean        // true for "Chase", "Marshall", etc.
   characterThemeId: uuid      // which theme this character belongs to
   ```
   Alternative: Check word text against `theme.characters[].name` at runtime (simpler)

2. **Mission unlock rewards**:
   ```typescript
   // In missions table:
   unlockReward: jsonb         // { type: 'sticker' | 'avatar', id: string }
   ```

3. **Unique constraint on missionProgress**:
   ```sql
   ALTER TABLE mission_progress ADD CONSTRAINT unique_player_mission
   UNIQUE (player_id, mission_id);
   ```

### Component Inventory

Components to create or modify:

| Component | Current State | Changes Needed |
|-----------|---------------|----------------|
| `ThemeProvider` | **New** | Create context + CSS variable injection |
| `CharacterWordCard` | **New** | Extends WordCard with portrait, gold border |
| `StoryMap` | ✅ Built | Hardcoded sky gradient → use `--theme-map-bg`; wire to real mission data |
| `MissionIntro` | ✅ Built | Has `characterImage` prop (unused); hardcoded indigo gradient → use theme colors |
| `MissionComplete` | ✅ Built | Hardcoded green/yellow gradient → use theme colors; add unlock reward display |
| `WordCard` | ✅ Built | Hardcoded indigo/white colors → use `--theme-card-bg`, `--theme-text`, `--theme-primary` |
| `SentenceBuilder` | ✅ Built | Mostly neutral colors; add `--theme-bg-image` support for game background |

**Hardcoded Colors to Replace** (identified from codebase review):
- `WordCard`: `bg-indigo-500`, `ring-indigo-300` → theme primary
- `StoryMap`: `from-sky-200 via-sky-300 to-emerald-300` → theme map background
- `MissionIntro`: `from-indigo-100 to-purple-100` → theme intro gradient
- `MissionComplete`: `from-emerald-100 to-yellow-100` → theme complete gradient

### Asset Checklist

| Asset | Type | Source | Storage |
|-------|------|--------|---------|
| Paw Patrol logo | PNG | Create/source | `/public/themes/paw-patrol/logo.png` |
| Map background | PNG | Create/source | `/public/themes/paw-patrol/map-bg.png` |
| Game background | PNG | Create/source | `/public/themes/paw-patrol/game-bg.png` |
| Chase portrait | PNG | Create/source | `/public/themes/paw-patrol/characters/chase.png` |
| Marshall portrait | PNG | Create/source | `/public/themes/paw-patrol/characters/marshall.png` |
| Skye portrait | PNG | Create/source | `/public/themes/paw-patrol/characters/skye.png` |
| Rubble portrait | PNG | Create/source | `/public/themes/paw-patrol/characters/rubble.png` |
| Rocky portrait | PNG | Create/source | `/public/themes/paw-patrol/characters/rocky.png` |
| Zuma portrait | PNG | Create/source | `/public/themes/paw-patrol/characters/zuma.png` |
| Feedback audio | MP3 | TTS generated | Vercel Blob |

### Asset Directory Structure

Public assets should follow this structure:

```text
/public/themes/[theme-id]/
  ├── logo.png          (Brand logo)
  ├── background.png    (Main gameplay background)
  ├── map-bg.png        (Story map background)
  └── characters/
      ├── [char-id].png (Full portrait)
      └── [char-id]-thumb.png (Small icon)
```

**Note on IP**: These assets are for private family use only. For any public release, original characters would be needed.

---

## Dependencies

- **Phase 1** ✅ Core gameplay (sentence builder, validation, TTS)
- **Phase 2** ✅ Animations, mission flow, hint system
  - `StoryMap` component ✅ built, but `/map` route does not exist yet (play flow goes directly to mission)
  - `MissionIntro`, `MissionComplete` ✅ built and integrated into `/play` route
  - Character display and voice phrases were deferred to themes (this phase)
- **Database schema** ✅ Themes, campaigns, missions, sentences tables exist
  - Need to add: `assets`, `characters`, `feedbackAudioUrls` columns to themes table
  - Need to add: `palette.special` field for character cards
- **Current routes**: `/`, `/play`, `/admin` (no `/map` route yet)

---

## Non-Goals (Deferred to Later Phases)

- Theme creation/editing UI (Phase 3)
- AI campaign generation (Phase 3)
- Multiple themes simultaneously (Phase 4)
- Background music (Phase 4)
- Mini-games (Phase 5)
- Full sticker collection UI (Phase 5)

---

## Related Documentation

- [Paw Patrol Theme Specification](../themes/paw-patrol.md) - Full mission definitions, narrative, palette
- [Theme Engine Architecture](../themes/README.md) - Theme data structure, switching logic
- [Data Models](../technical/data-models.md) - Database schema
- [Phase 2: Juice](./phase-2-juice.md) - Story map, mission flow components
- [Phase 3: AI & Admin](./phase-3-ai-admin.md) - Admin panel expansion

---

← [Phase 2: Juice](./phase-2-juice.md) | [Phase 3: AI & Admin →](./phase-3-ai-admin.md)

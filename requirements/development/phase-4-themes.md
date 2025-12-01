# Phase 4: Themes & Polish

← [Phase 3: AI & Admin](./phase-3-ai-admin.md) | [Back to Development](./README.md)

---

## Status: ✅ Substantially Complete

**Last Updated**: 2025-11-30

Phase 4 ships three complete themed experiences on top of the Paw Patrol proof-of-concept, adds comprehensive theme editing capabilities, and polishes the entire game for launch-quality play.

> **Update 2025-11-30**: Major implementation sprint completed. Theme Editor UI, Artwork System, ThemePicker, Audio Controls, and seed scripts for Bluey and Marvel themes are now complete. Remaining work: asset creation, full QA testing, and accessibility review.

---

## Objective

Deliver a ship-ready multi-theme experience with full admin editing capabilities:

1. **Theme Editor**: Full CRUD for themes, campaigns, missions, and sentence assignment
2. **Artwork System**: Hierarchical artwork (mission → campaign → theme fallback)
3. **Multi-Theme**: Finalize Paw Patrol, add Bluey and Marvel campaigns
4. **Polish**: Audio, accessibility, and real-user testing

---

## What Phase 2.5 Delivered (Baseline)

- Theme runtime: `ThemeProvider` with CSS variables, persistence, reduced-motion flag, `/api/themes` endpoints
- Paw Patrol campaign seeded: 1 campaign, 13 missions, 56 sentences, character vocab, boss lock, `/api/missions` + `/api/progress`
- Story map flow wired: `/map` → MissionIntro → play → MissionComplete with Paw Patrol palette and characters
- Theme feedback audio generated and played via `useThemeFeedback`; admin ThemeViewer tab for preview
- Known defers to Phase 4: theme editing UI, sentence assignment, artwork management, additional themes

---

## Progress Summary

| Category | Status | Completion |
|----------|--------|------------|
| Theme Engine Hardening | ✅ Complete | 4/5 |
| Theme Editor (Admin) | ✅ Complete | 8/8 |
| Artwork System | ✅ Complete | 4/4 |
| Paw Patrol Ship-Ready | 🔄 In Progress | 2/6 |
| Bluey Theme | ✅ Script Ready | 4/6 |
| Marvel Theme | ✅ Script Ready | 4/6 |
| Audio & Music | ✅ Core Complete | 4/6 |
| Testing & Accessibility | ⏳ Planned | 0/5 |

**Overall**: Core infrastructure complete. Theme Editor, ThemePicker, AudioControls, and seed scripts implemented. Remaining: production assets, full QA, accessibility review.

---

## Task Details

### Theme Engine Hardening

- [x] Runtime foundation from Phase 2.5 (ThemeProvider, CSS vars, persistence, `/api/themes`)
- [x] Theme-aware components (WordCard, StoryMap, MissionIntro, MissionComplete use CSS vars)
- [x] Theme picker UI ("Choose Your Adventure" overlay on home/map with theme cards) *(2025-11-30)*
- [x] Per-theme progress tracking (progress saved per theme, not global) *(2025-11-30)*
- [ ] Unit/integration tests for theme system (CSS var application, `switchTheme`, reduced-motion)

### Theme Editor (Admin) — ✅ COMPLETE

Full CRUD for themes, campaigns, missions, and sentence assignment.

- [x] **Theme List View**: Grid/list of all themes with edit/delete/duplicate actions *(2025-11-30)*
  - `src/components/admin/ThemeListPage.tsx`
- [x] **Theme Editor**: Edit palette (color pickers), characters, feedback phrases, assets *(2025-11-30)*
  - `src/components/admin/ThemeEditorPage.tsx` with tabs: General, Palette, Characters, Feedback, Assets, Campaigns
- [x] **Campaign Manager**: Create/edit/delete campaigns within a theme, set artwork *(2025-11-30)*
  - `src/components/admin/CampaignEditorPage.tsx`
- [x] **Mission Editor**: Edit title, narratives, scaffolding level, type, artwork, unlock rewards *(2025-11-30)*
  - `src/components/admin/MissionEditorPage.tsx`
- [x] **Sentence Assignment UI**: Drag/drop unassigned sentences to missions; reorder within mission *(2025-11-30)*
  - Integrated into MissionEditorPage with assigned/unassigned pools
- [x] **Asset Uploader**: Upload images for theme/campaign/mission artwork to Vercel Blob *(2025-11-30)*
  - `src/app/api/admin/upload/route.ts`
- [x] **Audio Regeneration**: Button to regenerate feedback audio after phrase edits *(2025-11-30)*
  - Integrated into ThemeEditorPage Feedback tab
- [x] **Data Validation**: Warnings for orphaned missions, sentences without mission, missing words *(2025-11-30)*
  - Stats display in theme cards and editor pages

**Admin Routes**:
- `/admin/themes` - Theme list
- `/admin/themes/[id]` - Theme editor
- `/admin/themes/[id]/campaigns/[campaignId]` - Campaign/mission editor

**API Endpoints** (new):
- `PUT /api/admin/themes/[id]` - Update theme
- `DELETE /api/admin/themes/[id]` - Delete theme
- `POST /api/admin/campaigns` - Create campaign
- `PUT /api/admin/campaigns/[id]` - Update campaign
- `DELETE /api/admin/campaigns/[id]` - Delete campaign
- `POST /api/admin/missions` - Create mission
- `PUT /api/admin/missions/[id]` - Update mission
- `DELETE /api/admin/missions/[id]` - Delete mission
- `PUT /api/admin/sentences/[id]` - Update sentence (including missionId assignment)
- `POST /api/admin/upload` - Upload asset to Vercel Blob

### Artwork System — ✅ COMPLETE

Hierarchical artwork with fallback chain: Mission → Campaign → Theme → Default.

- [x] **Schema Migration**: Add `artwork` JSONB column to campaigns and missions tables *(2025-11-30)*
  - Schema updated in `src/lib/db/schema.ts`
- [x] **Artwork Fallback Logic**: Helper function `getArtworkUrl(mission, campaign, theme, type)` *(2025-11-30)*
  - Implemented in `src/lib/artwork.ts`
- [x] **MissionIntro Integration**: Display artwork from fallback chain in intro screen *(2025-11-30)*
  - Updated `src/components/game/MissionIntro.tsx` with `introImage`, `characterImage`, `characterName` props
- [x] **MissionComplete Integration**: Display artwork in completion screen *(2025-11-30)*
  - Updated `src/components/game/MissionComplete.tsx` with `outroImage`, `characterImage`, `characterName`, `outroNarrative` props

**Schema Additions**:
```typescript
// campaigns table
artwork: jsonb("artwork").$type<{
  background?: string;     // Campaign-specific background
  introImage?: string;     // Default image for mission intros
}>()

// missions table
artwork: jsonb("artwork").$type<{
  introImage?: string;     // Mission-specific intro image
  outroImage?: string;     // Mission-specific completion image
  character?: string;      // Featured character ID for this mission
}>()
```

**Fallback Chain**:
```
MissionIntro artwork:
  mission.artwork.introImage
    → campaign.artwork.introImage
      → theme.assets.background
        → default gradient

Character display:
  mission.artwork.character
    → campaign theme's first character
      → no character shown
```

### Paw Patrol Ship-Ready (from POC → launch)

- [x] Campaign seeded: palette, 13 missions/56 sentences, feedback audio via `useThemeFeedback`
- [x] Character detection and CharacterWordCard rendering in gameplay
- [ ] Replace placeholder character portraits with production assets (128-256px PNG)
- [ ] Add mission-specific artwork for key missions (intro images)
- [ ] Boss completion celebration: special reward screen, "Paw Patrol Champion" sticker
- [ ] Progress persistence validation: verify DB writes, map unlocks, star totals across reloads

### Bluey Theme — ✅ Script Ready

- [x] Create theme record: palette (pastel blue/orange), assets, 6 characters (Bluey, Bingo, Bandit, Chilli, Muffin, Socks) *(2025-11-30)*
- [x] Design campaign: "Backyard Adventures" with 13 missions, ~50 sentences, distractors *(2025-11-30)*
- [x] Create seed script: `scripts/seed-bluey.ts` *(2025-11-30)*
- [x] Generate feedback phrases (correct, encourage, celebrate) *(2025-11-30)*
- [ ] Add production character artwork (128-256px PNG)
- [ ] QA: full playthrough, boss lock, progress persistence

### Marvel Theme — ✅ Script Ready

- [x] Create theme record: palette (bold red/blue/gold), assets, 6 heroes (Iron Man, Captain America, Spider-Man, Thor, Hulk, Black Widow) *(2025-11-30)*
- [x] Design campaign: "Hero Training" with 13 missions, ~50 sentences, narratives, unlock rewards *(2025-11-30)*
- [x] Create seed script: `scripts/seed-marvel.ts` *(2025-11-30)*
- [x] Generate feedback phrases (heroic phrases) *(2025-11-30)*
- [ ] Add production character artwork (128-256px PNG)
- [ ] QA: full playthrough, boss lock, progress persistence

### Audio & Music — ✅ Core Complete

- [x] Feedback phrase TTS pipeline validated (stored in Blob, played via `useThemeFeedback`)
- [x] Web Audio API synth sounds for UI feedback (`useSoundEffects.ts`)
- [ ] SFX pack curation per theme (tap, chime, celebration sounds with normalized loudness)
- [ ] Background music per theme (loopable BGM with start/stop controls)
- [x] Mute toggle UI (visible control for users to mute all audio) *(2025-11-30)*
  - `src/components/ui/AudioControls.tsx` with MuteToggle, AudioControlsPanel, AudioControlsButton
  - Added to home page, map, and play pages
- [x] Volume balancing across narration, feedback, and SFX; default to kid-safe levels *(2025-11-30)*
  - `src/lib/audio/AudioContext.tsx` - Master/Music/SFX/Voice volume controls with localStorage persistence
  - Quick Settings presets: "Quiet Mode" and "Normal"

### Testing & Accessibility

- [ ] Regression suite: map → intro → play → complete → map across all themes
- [ ] Accessibility pass: focus order, ARIA for star ratings/progress, readable contrast
- [ ] Performance testing: load times, animation FPS on low-end tablets
- [ ] Data quality checks: admin indicators for missing sentences/words, orphaned missions
- [ ] Bug fixes and polish from kid playtests

---

## Schema Changes Required

### New Columns

```sql
-- Add artwork JSONB to campaigns
ALTER TABLE campaigns ADD COLUMN artwork JSONB;

-- Add artwork JSONB to missions
ALTER TABLE missions ADD COLUMN artwork JSONB;
```

### TypeScript Types

```typescript
// In schema.ts

export type CampaignArtwork = {
  background?: string;
  introImage?: string;
};

export type MissionArtwork = {
  introImage?: string;
  outroImage?: string;
  character?: string;
};

// Update campaigns table
artwork: jsonb("artwork").$type<CampaignArtwork>(),

// Update missions table
artwork: jsonb("artwork").$type<MissionArtwork>(),
```

---

## Admin UI Mockups

### Theme List (`/admin/themes`)

```
┌─────────────────────────────────────────────────────────────────┐
│  Themes                                         [+ New Theme]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ 🐕 Paw      │  │ 🐶 Bluey    │  │ 🦸 Marvel   │             │
│  │   Patrol    │  │             │  │             │             │
│  │             │  │             │  │             │             │
│  │ 1 campaign  │  │ 0 campaigns │  │ 0 campaigns │             │
│  │ 13 missions │  │             │  │             │             │
│  │ ✅ Active   │  │ ⚠️ No data  │  │ ⚠️ No data  │             │
│  │             │  │             │  │             │             │
│  │ [Edit]      │  │ [Edit]      │  │ [Edit]      │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Theme Editor (`/admin/themes/[id]`)

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back to Themes    Paw Patrol                    [Save] [⚙️]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [General] [Palette] [Characters] [Feedback] [Assets]           │
│  ─────────────────────────────────────────────────────          │
│                                                                 │
│  Palette                                                        │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  Primary    [#1E3A8A] ████  Secondary [#3B82F6] ████ │       │
│  │  Accent     [#F59E0B] ████  Background[#EFF6FF] ████ │       │
│  │  Card BG    [#FFFFFF] ████  Text      [#1F2937] ████ │       │
│  │  Success    [#10B981] ████  Special   [#F59E0B] ████ │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                                 │
│  Campaigns                                    [+ Add Campaign]  │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  Adventure Bay Rescue                                │       │
│  │  13 missions • 56 sentences                          │       │
│  │  [Manage Missions] [Edit] [Delete]                   │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Sentence Assignment (in Mission Editor)

```
┌─────────────────────────────────────────────────────────────────┐
│  Mission: Chase to the Rescue          Sentences (3)            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Assigned Sentences                     Unassigned Pool         │
│  ┌────────────────────────┐            ┌────────────────────┐   │
│  │ 1. Chase can run fast. │            │ The big dog runs.  │   │
│  │    [↑] [↓] [×]         │            │ [+ Add]            │   │
│  │                        │            ├────────────────────┤   │
│  │ 2. Help is on the way! │            │ Look at the cat.   │   │
│  │    [↑] [↓] [×]         │            │ [+ Add]            │   │
│  │                        │            ├────────────────────┤   │
│  │ 3. Pups, let's go!     │            │ We can play here.  │   │
│  │    [↑] [↓] [×]         │            │ [+ Add]            │   │
│  └────────────────────────┘            └────────────────────┘   │
│                                                                 │
│  [Save Order]                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Deliverables

| Deliverable | Status |
|-------------|--------|
| Theme engine with picker UI | ✅ Complete |
| Theme Editor (full CRUD) | ✅ Complete |
| Artwork system (hierarchical) | ✅ Complete |
| Paw Patrol launch-ready | 🔄 Needs Assets |
| Bluey theme live | ✅ Script Ready (needs assets) |
| Marvel theme live | ✅ Script Ready (needs assets) |
| Audio + music polish | ✅ Core Complete (needs BGM/SFX packs) |
| Tested with real users | ⏳ Planned |

---

## Exit Criteria

> Ship-ready, multi-theme experience with full admin editing capabilities.

- [x] Theme picker available with per-theme progress display *(2025-11-30)*
- [x] Admin can create/edit themes, campaigns, missions, and assign sentences *(2025-11-30)*
- [x] Artwork displays in mission intros with proper fallback chain *(2025-11-30)*
- [ ] Paw Patrol, Bluey, and Marvel campaigns playable end-to-end (needs seed scripts run)
- [ ] Boss/celebration flows reward stickers and return to map
- [x] Reduced-motion respected; audio balanced with mute toggle *(2025-11-30)*
- [ ] Regression + accessibility checks pass

---

## Dependencies

- Phase 1-3 complete ✅
- Phase 2.5: Theme POC complete ✅ (Paw Patrol data, theme runtime, feedback audio)
- Theme assets (images, audio, music) for Bluey and Marvel
- Schema migration for artwork columns

---

## Implementation Order (Recommended)

1. **Schema Migration**: Add artwork columns to campaigns/missions
2. **Theme Editor API**: CRUD endpoints for themes/campaigns/missions
3. **Theme Editor UI**: Admin pages for editing
4. **Sentence Assignment**: Drag-drop UI for assigning sentences to missions
5. **Artwork Integration**: Update MissionIntro/Complete to use artwork fallback
6. **Theme Picker**: UI for switching themes on home/map
7. **Bluey Theme**: Seed script and content
8. **Marvel Theme**: Seed script and content
9. **Audio Polish**: BGM, SFX packs, mute toggle
10. **Testing**: Full QA pass across all themes

---

## Related Documentation

- [Themes Overview](../themes/README.md)
- [Paw Patrol Theme](../themes/paw-patrol.md)
- [Bluey Theme](../themes/bluey.md)
- [Marvel Theme](../themes/marvel-avengers.md)
- [Sound Design](../audio/sound-design.md)
- [Content Management](../admin-dashboard/content-management.md)
- [Data Models](../technical/data-models.md)

---

← [Phase 3: AI & Admin](./phase-3-ai-admin.md) | [Phase 5: Beyond →](./phase-5-beyond.md)

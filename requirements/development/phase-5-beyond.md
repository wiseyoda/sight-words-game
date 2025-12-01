# Phase 5: Beyond (Post-Launch)

← [Phase 4: Themes](./phase-4-themes.md) | [Back to Development](./README.md)

---

## Status: 🧭 Planning (prereqs built)

**Last Updated**: 2025-11-30

Phase 5 expands the game with mini-games, additional content, and future features beyond the initial launch scope. Theme/campaign tooling, map/progress APIs, and audio/artwork pipelines now exist in the codebase, so this phase can focus on new experiences instead of foundations.

---

## Objective

Expand with mini-games and additional content to keep the experience fresh and engaging long-term.

---

## Progress Summary

| Category | Status | Completion | Notes |
|----------|--------|------------|-------|
| Foundations (themes, campaigns, audio, map) | ✅ Ready | 4/4 | Theme editor, campaign/mission admin, artwork/TTS pipelines, map + progress APIs live |
| Mini-Games | ⏳ Not Started | 0/5 | Mechanics not implemented |
| Rewards & Content | ⏳ Not Started | 0/4 | Stickers, new themes, custom wizard, word levels pending |
| Future Features | ⏳ Not Started | 0/4 | Voice, multiplayer, printables, more games |

**Overall**: Prereqs complete; Phase 5 feature work not started.

---

## Current Foundation (from code)

- Theme + campaign system: Theme editor, campaign/mission editors, artwork upload/generation endpoints, and theme assets are in place.
- Story map + progress: Map route and `/api/progress` expose player theme/campaign/mission state, mission unlock rules, and player unlock storage.
- Audio + artwork pipelines: OpenAI TTS + regeneration buttons, Vercel Blob uploads, and artwork slots per theme/campaign/mission.
- Theme selection + seeds: Theme picker modal wired to `/api/themes`; seed scripts (Paw Patrol, Bluey, Marvel) and AI generators exist to populate content.

---

## Task Details (Phase 5 scope)

### Mini-Games

- [ ] Word Bingo implementation (standalone route + shared mini-game shell using theme palette/audio)
- [ ] Memory Match implementation (word/word and word/image pairs; TTS on flip)
- [ ] Whack-a-Word implementation (timed taps with gentle feedback)
- [ ] Mini-game unlock conditions (tie to mission progress and `player_unlocks`; surface on map)
- [ ] Integration with story map (new node types, completion persistence, and return to campaign flow)

**Mini-Game Specs:** See [Mini-Games](../gameplay/mini-games.md)

### Rewards & Content

- [ ] Sticker collection UI (award via missions/mini-games; persist to `player_unlocks`; view in profile/map)
- [ ] More themes (ship Bluey/Marvel seeds with artwork/audio; add 1-2 new launch-ready themes)
- [ ] Custom theme wizard (parent-facing flow wrapping existing generators + Theme Editor)
- [ ] Additional word levels (Primer, Grade 1+, map gating, and progress reporting)

### Future Features

- [ ] Voice recognition for reading aloud
- [ ] Multiplayer/sibling mode (take turns)
- [ ] Print worksheets (PDF generation)
- [ ] More mini-games (spelling, writing)

---

## Deliverables

| Deliverable | Status | Notes |
|-------------|--------|-------|
| Three mini-games | ⏳ Not Started | Word Bingo, Memory Match, Whack-a-Word |
| Expanded content library | ⏳ Not Started | New themes, sticker sets, added word levels |
| Foundation for future growth | 🧭 Planning | Data model + admin flows ready; feature work pending |

---

## Exit Criteria

> Game has enough variety to remain engaging for months of play.

**Status**: ⏳ Not Started

---

## Dependencies

- Phase 4 polish items (per-theme progress display, player management UI) to reduce rework
- User feedback from real usage

---

## Prioritization

### High Priority (First Post-Launch)
1. Word Bingo + mini-game shell (ensures one completed loop with theme styling and audio)
2. Map integration + unlock rules for mini-games
3. Sticker collection and rewards that use existing `player_unlocks`
4. Additional themes (seed + artwork/audio polish)

### Medium Priority
5. Memory Match
6. Custom theme wizard
7. Additional word levels

### Lower Priority (Long-Term)
8. Whack-a-Word
9. Voice recognition
10. Multiplayer mode
11. Print worksheets

---

## Near-Term Next Steps

- Define mini-game session data model (per-player attempts, stars, unlocks) and wire to `/api/progress`.
- Add map node type + navigation flow for mini-games in `MapClient`/`StoryMap`, including return-to-campaign behaviour.
- Ship one themed, TTS-enabled mini-game (Word Bingo) using existing audio hooks and theme palette variables.
- Implement sticker rewards on mission/mini-game completion and a simple viewer; seed 10-20 starter stickers.
- Harden theme seeds (Paw Patrol, Bluey, Marvel) with artwork + audio so mini-games have content breadth.

---

## Related Documentation

- [Mini-Games](../gameplay/mini-games.md)
- [Unlockables](../progression/unlockables.md)
- [Custom Themes](../themes/custom-themes.md)
- [Word Lists](../curriculum/word-lists.md)

---

← [Phase 4: Themes](./phase-4-themes.md) | [Development Overview](./README.md)

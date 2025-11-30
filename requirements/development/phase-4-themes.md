# Phase 4: Themes & Polish

← [Phase 3: AI & Admin](./phase-3-ai-admin.md) | [Back to Development](./README.md)

---

## Status: ⏳ Ready (Phase 2.5 foundation delivered)

**Last Updated**: 2025-11-30

Phase 4 ships three complete themed experiences on top of the Paw Patrol proof-of-concept and polishes the entire game for launch-quality play.

---

## Objective

Deliver a ship-ready multi-theme experience: finalize Paw Patrol for launch, add Bluey and Marvel campaigns, and harden the theme/audio systems.

---

## What Phase 2.5 Delivered (Baseline)

- Theme runtime: `ThemeProvider` with CSS variables, persistence, reduced-motion flag, `/api/themes` endpoints.
- Paw Patrol campaign seeded: 1 campaign, 13 missions, 56 sentences, character vocab, boss lock, `/api/missions` + `/api/progress`.
- Story map flow wired: `/map` → MissionIntro → play → MissionComplete with Paw Patrol palette and characters.
- Theme feedback audio generated and played via `useThemeFeedback`; admin ThemeViewer tab for preview.
- Known defers to Phase 4+: theme system tests, progress persistence QA, celebration screen, placeholder character art, narrative audio.

---

## Progress Summary

| Category | Status | Completion |
|----------|--------|------------|
| Theme Engine Hardening | 🔄 In Prep | 1/4 |
| Paw Patrol Ship-Ready | 🔄 In Prep | 1/5 |
| Bluey Theme | ⏳ Planned | 0/6 |
| Marvel Theme | ⏳ Planned | 0/6 |
| Audio & Music | ⏳ Planned | 1/5 |
| Testing & Accessibility | ⏳ Planned | 0/5 |

**Overall**: Foundation complete via Phase 2.5; remaining work focuses on multi-theme rollout and polish.

---

## Task Details

### Theme Engine Hardening

- [x] Runtime foundation from Phase 2.5 (ThemeProvider, CSS vars, persistence, `/api/themes`)
- [ ] Theme switcher UI (map/home picker, per-theme progress, persists to player)
- [ ] Unit/integration tests for theme system (CSS var application, `switchTheme`, reduced-motion)
- [ ] Cross-theme QA: StoryMap, MissionIntro/Complete, WordCard/CharacterWordCard fallbacks when assets are missing

### Paw Patrol Ship-Ready (from POC → launch)

- [x] Campaign seeded: palette, 13 missions/56 sentences, feedback audio via `useThemeFeedback`
- [ ] Replace placeholder character portraits and background art with production assets (128-256px PNG)
- [ ] Progress persistence validation: DB writes from `/api/progress`, map unlocks, star totals across reloads
- [ ] Boss completion celebration: reward screen, "Paw Patrol Champion" sticker/avatars, loop-back to map
- [ ] Narrative polish: optional TTS for mission intros/outros plus volume balance against SFX

### Bluey Theme

- [ ] Palette + assets (map background, game background, logo, character portraits)
- [ ] Campaign design + seeding (13 missions, sentences, distractors, unlock rewards)
- [ ] Story map integration using Bluey assets
- [ ] Feedback phrases + pre-generated audio (TTS), wired through theme audio hook
- [ ] Character cards + vocabulary tagging
- [ ] QA: boss lock, progress persistence, reduced-motion variants

### Marvel Theme

- [ ] Palette + assets (NYC/Avengers backgrounds, logo, hero portraits)
- [ ] Campaign design + seeding (16 missions, narratives, unlock rewards)
- [ ] Story map integration using Marvel assets
- [ ] Feedback phrases + pre-generated audio (TTS), wired through theme audio hook
- [ ] Character cards + vocabulary tagging
- [ ] QA: boss lock, progress persistence, reduced-motion variants

### Audio & Music

- [x] Feedback phrase TTS pipeline validated with Paw Patrol (stored in Blob, played via `useThemeFeedback`)
- [ ] SFX pack curation per theme (taps, chimes, celebration, fail) with normalized loudness
- [ ] Background music per theme (loopable, start/stop controls, mute toggle)
- [ ] Volume balancing across narration, feedback, and SFX; default to kid-safe levels
- [ ] Audio optimization/caching for low-end devices (preload feedback clips, avoid stutter)

### Testing & Accessibility

- [ ] Regression suite: map → intro → play → complete → map across all themes
- [ ] Accessibility pass: focus order, ARIA for star ratings/progress, readable contrast with theme colors
- [ ] Performance testing: load times, animation FPS on low-end tablets
- [ ] Data quality checks: admin indicators for missing sentences/words, orphaned missions
- [ ] Bug fixes and polish from kid playtests (record issues back into backlog)

---

## Deliverables

| Deliverable | Status |
|-------------|--------|
| Theme engine ready for switching | 🔄 In Prep (UI + tests pending) |
| Paw Patrol launch-ready | 🔄 In Prep (assets/celebration/persistence QA) |
| Bluey theme live | ⏳ Pending |
| Marvel theme live | ⏳ Pending |
| Audio + music polish | ⏳ Pending |
| Tested with real users | ⏳ Pending |

---

## Exit Criteria

> Ship-ready, multi-theme experience kids can use daily.

- Theme switcher available with per-theme progress
- Paw Patrol, Bluey, and Marvel campaigns playable end-to-end with correct assets and audio
- Boss/celebration flows reward stickers and return to map
- Reduced-motion respected; audio balanced with mute toggle
- Regression + accessibility checks pass; admin surfaces data issues before launch

---

## Dependencies

- Phase 1-3 complete
- Phase 2.5: Theme POC complete (Paw Patrol data, theme runtime, feedback audio)
- Theme assets (images, audio, music) for Bluey and Marvel

---

## Related Documentation

- [Themes Overview](../themes/README.md)
- [Paw Patrol Theme](../themes/paw-patrol.md)
- [Bluey Theme](../themes/bluey.md)
- [Marvel Theme](../themes/marvel-avengers.md)
- [Sound Design](../audio/sound-design.md)

---

← [Phase 3: AI & Admin](./phase-3-ai-admin.md) | [Phase 5: Beyond →](./phase-5-beyond.md)

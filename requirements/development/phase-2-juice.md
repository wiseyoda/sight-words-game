# Phase 2: The "Juice"

← [Phase 1: Engine](./phase-1-engine.md) | [Back to Development](./README.md)

---

## Status: ⏳ Planned

**Last Updated**: 2025-11-29

Phase 2 adds polish and "game feel" - making the experience engaging and satisfying.

---

## Objective

Make the game feel polished and engaging with animations, story progression, and feedback systems.

---

## Progress Summary

| Category | Status | Completion |
|----------|--------|------------|
| Animations | ⏳ Planned | 0/6 |
| Story Map | ⏳ Planned | 0/6 |
| Mission Flow | ⏳ Planned | 0/6 |
| Hints | ⏳ Planned | 0/6 |
| Feedback | ⏳ Planned | 0/5 |

**Overall**: 0/29 tasks complete (0%)

---

## Task Details

### Animations

- [ ] Card tap animation (scale + shadow)
- [ ] Card placement animation (fly + snap)
- [ ] Card return animation (bounce back)
- [ ] Correct sentence glow effect
- [ ] Incorrect sentence shake effect
- [ ] Celebration confetti burst

**Implementation Notes:**
- Use Framer Motion for declarative animations
- Respect `prefers-reduced-motion`
- Keep durations snappy (100-300ms for interactions)

### Story Map

- [ ] Map component with scrollable path
- [ ] Node rendering (circles/icons)
- [ ] Path connections between nodes
- [ ] Current position indicator (pulsing)
- [ ] Locked/unlocked states (visual differentiation)
- [ ] Navigation between nodes

**Design Reference:** See [Story Map](../progression/story-map.md)

### Mission Flow

- [ ] Mission intro screen (character + narrative)
- [ ] Narrative text display with TTS
- [ ] Character display (themed images)
- [ ] Transition animations between phases
- [ ] Mission complete screen
- [ ] Star reveal animation

**Flow:**
```
Map → Intro → Gameplay → Complete → Stars → Map
```

### Hints

- [ ] Hint button in gameplay header
- [ ] Level 1 hint: First word highlight
- [ ] Level 2 hint: Ghost words in slots
- [ ] Level 3 hint: Full sentence audio
- [ ] Hint cooldown (prevent spam)
- [ ] Star impact (hints reduce stars)

**Hint Progression:**
- First hint: Free
- Second hint: -1 star potential
- Third hint: -1 additional star potential

### Feedback

- [ ] Correct sound effect (celebration chime)
- [ ] Incorrect sound effect (soft boing)
- [ ] Voice phrases (random TTS encouragement)
- [ ] Progress indicator (X of Y sentences)
- [ ] Star calculation logic

**Star Rules:**
- 3 stars: No hints, first try
- 2 stars: 1 hint OR 1 retry
- 1 star: 2+ hints OR 2+ retries

---

## Deliverables

| Deliverable | Status |
|-------------|--------|
| Complete mission flow | ⏳ Pending |
| Animated, satisfying interactions | ⏳ Pending |
| Story map navigation | ⏳ Pending |
| Working hint system | ⏳ Pending |

---

## Exit Criteria

> Complete mission flow feels like a real game.

**Status**: ⏳ Not Started

---

## Dependencies

- Phase 1 core gameplay (complete)
- Framer Motion (already installed)
- Sound effects library

---

## Related Documentation

- [Feedback System](../gameplay/feedback-system.md)
- [Story Map](../progression/story-map.md)
- [Design Principles](../ux-design/design-principles.md)
- [Sound Design](../audio/sound-design.md)

---

← [Phase 1: Engine](./phase-1-engine.md) | [Phase 3: AI & Admin →](./phase-3-ai-admin.md)

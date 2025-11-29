# Gameplay Mechanics

← [Back to Index](../README.md)

---

## Overview

The core gameplay loop involves children building sentences by arranging word cards. This section details all gameplay mechanics.

## Documents in This Section

| Document | Description |
|----------|-------------|
| [Core Loop](./core-loop.md) | Mission structure, session flow, pacing |
| [Sentence Builder](./sentence-builder.md) | Word placement, validation, scaffolding |
| [Feedback System](./feedback-system.md) | Hints, encouragement, celebrations |
| [Mini-Games](./mini-games.md) | Bingo, Memory Match, Whack-a-Word |

---

## Quick Reference

### Session Structure

| Metric | Value |
|--------|-------|
| Target session length | 10-15 minutes |
| Missions per session | 3-5 |
| Sentences per mission | 3-5 |
| Words per sentence | 3-7 |

### Core Interaction

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│    SENTENCE AREA                                         │
│    ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌─┐                         │
│    │   │ │   │ │   │ │   │ │.│  ← Empty slots          │
│    └───┘ └───┘ └───┘ └───┘ └─┘                         │
│                                                          │
│    WORD BANK                                             │
│    ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐             │
│    │ The │ │ dog │ │ can │ │ run │ │fast │             │
│    └─────┘ └─────┘ └─────┘ └─────┘ └─────┘             │
│                                                          │
└──────────────────────────────────────────────────────────┘

Child taps "The" → moves to first slot
Child taps "dog" → moves to second slot
...continues until sentence is complete
Child taps CHECK → sentence is validated
```

### Input Methods

| Method | Priority | Description |
|--------|----------|-------------|
| Tap-to-Place | Primary | Tap card, auto-places in next slot |
| Drag-and-Drop | Secondary | Drag to specific slot, magnet-snap |

### Validation

**AI-Powered**: Sentences are validated by LLM, not strict matching.

```
"The cat and dog run" → VALID
"The dog and cat run" → VALID (both grammatically correct)
"Cat the dog run and" → INVALID (not grammatical)
```

---

## Key Principles

1. **No Time Pressure** - Children work at their own pace
2. **Unlimited Attempts** - Mistakes are learning opportunities
3. **Progressive Hints** - Help is always available
4. **Immediate Feedback** - Know instantly if correct
5. **Celebratory Success** - Make winning feel special

---

← [Back to Index](../README.md) | [Core Loop →](./core-loop.md)

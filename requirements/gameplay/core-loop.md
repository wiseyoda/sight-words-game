# Core Game Loop

← [Back to Gameplay](./README.md)

---

## The "Mission" Concept

Instead of abstract "levels", children play through **Missions** within themed **Campaigns**.

### Why "Missions"?

- **Narrative Context**: Each mission has a story purpose
- **Clear Objectives**: "Fix the bridge", "Save the kitten"
- **Completion Satisfaction**: Definite start and end
- **Replay Value**: Can revisit for better stars

---

## Session Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      COMPLETE SESSION                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐  │
│  │ Mission │ →  │ Mission │ →  │ Mission │ →  │  Break  │  │
│  │    1    │    │    2    │    │    3    │    │ Prompt  │  │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘  │
│                                                              │
│  Total Time: 10-15 minutes                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Single Mission Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      MISSION STRUCTURE                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. BRIEFING (5-10 seconds)                                 │
│     ┌─────────────────────────────────────────────────┐    │
│     │  [Character Animation]                           │    │
│     │                                                  │    │
│     │  "Oh no! The bridge is broken! We need to       │    │
│     │   build words to fix it!"                        │    │
│     │                                                  │    │
│     │              [TAP TO START]                      │    │
│     └─────────────────────────────────────────────────┘    │
│                                                              │
│  2. ACTION PHASE (2-5 minutes)                              │
│     ┌─────────────────────────────────────────────────┐    │
│     │  Sentence 1 of 4        ○ ● ○ ○                 │    │
│     │                                                  │    │
│     │  [Sentence Builder Interface]                    │    │
│     │                                                  │    │
│     │  Visual Progress: Bridge building piece by piece │    │
│     └─────────────────────────────────────────────────┘    │
│                                                              │
│  3. REWARD SCREEN (5-10 seconds)                            │
│     ┌─────────────────────────────────────────────────┐    │
│     │           🌟 MISSION COMPLETE! 🌟               │    │
│     │                                                  │    │
│     │              ⭐ ⭐ ⭐                             │    │
│     │          "You earned 3 stars!"                   │    │
│     │                                                  │    │
│     │  [Character doing victory dance]                 │    │
│     │                                                  │    │
│     │     [Unlocked: Rocket Avatar! 🚀]                │    │
│     │                                                  │    │
│     │         [CONTINUE]  [MAP]                        │    │
│     └─────────────────────────────────────────────────┘    │
│                                                              │
│  4. MAP RETURN                                               │
│     → Current node shows earned stars                       │
│     → Next node unlocks with animation                      │
│     → "Keep Playing?" or "Take a Break?"                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Mission Types

| Type | Icon | Purpose | Frequency |
|------|------|---------|-----------|
| **Play** | ⭐ | Standard sentence-building | 70% of nodes |
| **Treasure** | 🎁 | Award unlock, minimal gameplay | Every 3rd node |
| **Mini-Game** | 🎮 | Reinforcement game | 2 per campaign |
| **Boss** | 👑 | Harder finale (5-7 sentences) | End of campaign |

### Play Mission

- 3-5 sentences to complete
- Increasing difficulty within mission
- Visual progress (e.g., building a bridge piece by piece)
- Stars based on performance

### Treasure Mission

- Short narrative moment
- Automatic unlock (avatar, sticker)
- Celebration animation
- No sentence building required
- Bridges narrative between acts

### Mini-Game Mission

- Different gameplay mechanic
- Still reinforces sight words
- Shorter duration (1-3 minutes)
- See [Mini-Games](./mini-games.md) for details

### Boss Mission

- 5-7 sentences (vs normal 3-5)
- Fewer scaffolding hints
- Higher narrative stakes
- Extra special celebration
- Unlocks next campaign

---

## Session Metrics

| Metric | Target | Range |
|--------|--------|-------|
| Session length | 12 min | 10-15 min |
| Missions per session | 4 | 3-5 |
| Sentences per mission | 4 | 3-5 |
| Words per sentence | 5 | 3-7 |
| Time per sentence | 45 sec | 20-90 sec |

### Natural Break Points

After each mission, prompt:

```
┌─────────────────────────────────────────┐
│                                          │
│    Great job! You completed 3 missions! │
│                                          │
│    ┌──────────────┐  ┌──────────────┐   │
│    │              │  │              │    │
│    │   KEEP       │  │   TAKE A     │    │
│    │   PLAYING    │  │   BREAK      │    │
│    │              │  │              │    │
│    └──────────────┘  └──────────────┘   │
│                                          │
└─────────────────────────────────────────┘
```

### Session Time Reminder (Optional)

If enabled in parent settings:

- After 15 minutes: Gentle reminder "You've been playing for a while!"
- After 20 minutes: Stronger suggestion to take a break
- Never force-quit (parent's discretion)

---

## Difficulty Progression

### Within a Mission

| Sentence | Difficulty |
|----------|------------|
| 1st | Easiest - warm-up |
| 2nd | Slightly harder |
| 3rd | Standard |
| 4th | Challenge |
| 5th (if present) | Hardest |

### Within a Campaign

| Missions | Scaffolding | Sentence Count |
|----------|-------------|----------------|
| 1-3 | Heavy (ghost words) | 3 |
| 4-8 | Medium (color hints) | 4 |
| 9-12 | Light (first word only) | 4-5 |
| Boss | None | 5-7 |

### Across Campaigns

| Campaign | Word List | Complexity |
|----------|-----------|------------|
| 1 | Pre-Primer (40 words) | 3-5 word sentences |
| 2 | Primer (52 words) | 4-6 word sentences |
| 3 | First Grade (41 words) | 5-7 word sentences |
| 4+ | Mixed + Custom | Variable |

---

## State Persistence

### What Gets Saved

- Current campaign and mission
- Stars per mission (1-3)
- Completed mission IDs
- Word mastery per word
- Unlocked avatars/stickers
- Cumulative stats

### Save Triggers

- After each sentence completion
- After mission completion
- Before exiting to map
- On app background (mobile)

### Resume Behavior

When child returns:
1. Show Story Map with current progress
2. Last-played mission has "Continue" badge
3. Can replay any completed mission
4. Can advance to any unlocked mission

---

## Edge Cases

### Child Gives Up Mid-Mission

- Progress within mission is NOT saved
- Stars are NOT earned
- Can restart mission fresh
- No penalty or shame

### Child Stuck on Sentence

- Hint button pulses after 15 seconds
- Auto-offer hint after 3 failed attempts
- Never time-out or force-skip
- Parent can assist (no account action)

### Connection Lost Mid-Mission

- Show friendly error: "Oops! We lost internet."
- Offer retry button
- If persistent, suggest break
- Resume mission when connected

---

← [Back to Gameplay](./README.md) | [Sentence Builder →](./sentence-builder.md)

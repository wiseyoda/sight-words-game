# Mini-Games

← [Back to Gameplay](./README.md)

---

## Purpose

Mini-games provide variety and reinforcement without sentence structure. They appear as special nodes on the Story Map.

---

## Unlock Conditions

| Game | Unlock Requirement | Map Position |
|------|-------------------|--------------|
| Word Bingo | Complete 5 missions | After mission 5 |
| Memory Match | Complete 10 missions | After mission 10 |
| Whack-a-Word | Complete first campaign | After boss |

---

## Word Bingo

### Overview

Classic bingo mechanics adapted for sight word recognition.

**Duration**: 2-3 minutes
**Words Used**: 9 words per game
**Input**: Tap only

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [⬅️ Back]        WORD BINGO         [🔊 Speaker]           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│              🎯 Find the word: [PLAY AUDIO]                  │
│                                                              │
│         ┌───────┬───────┬───────┐                           │
│         │       │       │       │                            │
│         │  the  │  can  │  run  │                            │
│         │       │       │       │                            │
│         ├───────┼───────┼───────┤                            │
│         │       │       │       │                            │
│         │  see  │  go   │  up   │                            │
│         │       │       │       │                            │
│         ├───────┼───────┼───────┤                            │
│         │       │       │       │                            │
│         │  is   │  it   │ play  │                            │
│         │       │       │       │                            │
│         └───────┴───────┴───────┘                           │
│                                                              │
│         Progress: ○ ○ ○ ○ ○ (5 to win)                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Gameplay Flow

1. **Setup**
   - 9 words placed in 3x3 grid
   - Words from current campaign
   - Random arrangement each game

2. **Round Start**
   - Voice says a word: "Find the word... 'the'!"
   - Audio plays automatically
   - Tap speaker to repeat

3. **Player Action**
   - Child taps the matching card
   - Correct: Card glows, chime, progress advances
   - Incorrect: Gentle shake, "Try again!"

4. **Win Condition**
   - Get 5 correct to win (any 5, not line-based)
   - Simplified from traditional bingo for age group
   - Celebration on completion

### Difficulty Variations

| Level | Grid | Similar Words |
|-------|------|---------------|
| Easy | 3x3 | All distinct |
| Medium | 3x3 | 2-3 similar (the/they) |
| Hard | 4x4 | Multiple similar pairs |

### Feedback

| Event | Response |
|-------|----------|
| Correct tap | Green glow, chime, "Great!" |
| Incorrect tap | Gentle shake, "That says [word], try again!" |
| Win | Full celebration, stars |

---

## Memory Match

### Overview

Card matching game pairing words with words or words with images.

**Duration**: 3-4 minutes
**Pairs**: 6 pairs (12 cards)
**Input**: Tap only

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [⬅️ Back]      MEMORY MATCH       Pairs: 0/6              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│       ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                       │
│       │  ?  │ │  ?  │ │  ?  │ │  ?  │                        │
│       └─────┘ └─────┘ └─────┘ └─────┘                       │
│                                                              │
│       ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                       │
│       │  ?  │ │ cat │ │  ?  │ │  ?  │  ← one revealed       │
│       └─────┘ └─────┘ └─────┘ └─────┘                       │
│                                                              │
│       ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                       │
│       │  ?  │ │  ?  │ │  ?  │ │  ?  │                        │
│       └─────┘ └─────┘ └─────┘ └─────┘                       │
│                                                              │
│         Moves: 12                                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Match Types

| Type | Card A | Card B | Difficulty |
|------|--------|--------|------------|
| Word-Word | "cat" | "cat" | Easiest |
| Word-Image | "cat" | 🐱 | Medium |
| Mixed | Both types in grid | Hardest |

### Gameplay Flow

1. **Setup**
   - 12 cards face-down
   - 6 matching pairs
   - Random arrangement

2. **Turn**
   - Tap first card → reveals word/image
   - Word is read aloud
   - Tap second card → reveals

3. **Match Check**
   - Match: Both cards stay up, glow green, chime
   - No match: Both flip back after 1.5 seconds
   - Gentle: "Keep looking!" or "Not quite!"

4. **Win Condition**
   - All 6 pairs matched
   - Celebration!

### Card Animations

| Action | Animation |
|--------|-----------|
| Reveal | 3D flip (Y-axis rotation) |
| Match | Glow + subtle pulse |
| No match | Gentle shake, flip back |
| Complete | All cards do wave |

### Accessibility

- Cards read aloud on reveal
- Image cards also announce word
- No time pressure
- Can tap revealed card to hear again

---

## Whack-a-Word

### Overview

Fast-paced word recognition game inspired by Whack-a-Mole.

**Duration**: 60-90 seconds
**Target**: 10 correct taps to win
**Input**: Tap only

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [⬅️ Back]     WHACK-A-WORD      Target: "the"   8/10      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│     🎯 Tap every "the" you see!                             │
│                                                              │
│         ┌───┐         ┌───┐         ┌───┐                   │
│         │the│         │   │         │can│                    │
│         └───┘         └───┘         └───┘                   │
│                                                              │
│                  ┌───┐         ┌───┐                        │
│                  │run│         │the│  ← Target!              │
│                  └───┘         └───┘                        │
│                                                              │
│         ┌───┐         ┌───┐         ┌───┐                   │
│         │see│         │the│         │   │                    │
│         └───┘         └───┘         └───┘                   │
│                                                              │
│     ⏱️ 0:45 remaining                                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Gameplay Flow

1. **Setup**
   - Target word announced: "Find 'the'!"
   - Word appears at top for reference
   - Timer starts

2. **Word Spawn**
   - Words pop up from "holes" (appear with animation)
   - Stay visible for 2-3 seconds
   - Disappear if not tapped

3. **Player Action**
   - Tap target word: +1 point, green flash
   - Tap distractor: No penalty, gentle "Not that one!"
   - Miss target: Word disappears, no penalty

4. **Win Condition**
   - Tap 10 correct words before timer ends
   - If timer ends before 10: "Good try! X/10"
   - Always positive: "You found 7 words!"

### Spawn Rules

| Rule | Value |
|------|-------|
| Spawn rate | 1 word every 800ms |
| Active words | Max 4 at once |
| Target ratio | 40% target, 60% distractors |
| Position | Random from 9 positions |

### Age-Appropriate Adjustments

| Aspect | Child-Friendly Choice |
|--------|----------------------|
| Timer | Generous (90 seconds) |
| Penalty | None for wrong taps |
| Speed | Slow spawns, long visibility |
| Win threshold | Low (10 taps) |
| Fail state | "Great try!" not "Game Over" |

### Difficulty Levels

| Level | Spawn Rate | Visibility | Target % |
|-------|------------|------------|----------|
| Easy | 1000ms | 3 sec | 50% |
| Medium | 800ms | 2.5 sec | 40% |
| Hard | 600ms | 2 sec | 35% |

---

## Mini-Game Rewards

### Stars

| Performance | Stars |
|-------------|-------|
| Excellent (few/no mistakes) | ⭐⭐⭐ |
| Good (some mistakes) | ⭐⭐ |
| Completed | ⭐ |

### Word Mastery

- Mini-games contribute to word mastery tracking
- Correct recognition = "seen" and "correct" increment
- Data feeds adaptive difficulty

### Unlockables

- Mini-games can award stickers
- Special "Mini-Game Master" stickers
- Count toward total stars

---

## Future Mini-Games

### Spelling Sprint (Phase 5+)

- Hear word, drag letters to spell it
- Focus on letter recognition + sight word
- Harder difficulty level

### Word Pairs (Phase 5+)

- Connect rhyming words
- Connect opposites (big/small)
- Educational + fun

### Story Sequence (Phase 5+)

- Arrange 3-4 sentence cards in order
- Creates mini-story
- Higher reading comprehension

---

← [Gameplay](./README.md)

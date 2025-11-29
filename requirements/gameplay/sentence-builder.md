# Sentence Builder

← [Back to Gameplay](./README.md)

---

## Overview

The Sentence Builder is the core interaction mechanic. Children arrange word cards to form correct sentences.

---

## Interface Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [⬅️ Back]    Mission 3: Fix the Bridge    [💡 Hint]        │
│               ⭐⭐⭐ (potential stars)                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                      │   │
│  │   [Theme character on left side, encouraging]        │   │
│  │                                                      │   │
│  │         SENTENCE SLOTS                               │   │
│  │         ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌─┐                │   │
│  │         │   │ │   │ │   │ │   │ │.│                │   │
│  │         └───┘ └───┘ └───┘ └───┘ └─┘                │   │
│  │                                                      │   │
│  │   Slots are sized to fit word cards perfectly       │   │
│  │                                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│     WORD BANK (shuffled order)                              │
│     ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐           │
│     │ The │  │ dog │  │ can │  │ run │  │fast │           │
│     └─────┘  └─────┘  └─────┘  └─────┘  └─────┘           │
│                                                              │
│     + 1-2 distractor words (not needed)                     │
│     ┌─────┐  ┌─────┐                                        │
│     │ cat │  │ big │                                        │
│     └─────┘  └─────┘                                        │
│                                                              │
│                    [ ✓ CHECK ]                              │
│                                                              │
│   Sentence 2 of 4    ○ ● ○ ○                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Input Methods

### 1. Tap-to-Place (Primary)

**Behavior**:
1. Child taps a word card in the word bank
2. Card animates to the **first empty slot**
3. Slot "accepts" the card with satisfying snap
4. Word is read aloud

**Why Primary**:
- Simpler motor skills required
- Works well on all touch devices
- Faster for confident children
- Less frustrating than missed drags

**Edge Cases**:
- All slots filled: Card returns to bank with gentle shake
- Double-tap: No effect (debounced)
- Tap while animating: Queued

### 2. Drag-and-Drop (Secondary)

**Behavior**:
1. Child touches and holds a word card
2. Card lifts with scale effect (1.1x)
3. Child drags toward slots
4. Nearby slot highlights (magnet zone: 40px radius)
5. Release within zone: Card snaps to slot
6. Release outside zone: Card returns to bank

**Magnet Assistance**:
- Card doesn't need to be perfectly placed
- Snapping zone is generous
- Visual feedback shows when "close enough"

**Why Secondary**:
- More cognitive load (where to drop)
- Harder for small fingers
- Useful for reordering placed cards

### 3. Tap-to-Remove

**Behavior**:
1. Child taps a word already in a slot
2. Card animates back to word bank
3. Slot becomes empty again
4. Word is read aloud

**Use Case**:
- Child made a mistake
- Wants to reorder sentence
- Exploring different arrangements

---

## Word Cards

### Visual Design

```
┌──────────────────┐
│                  │
│      The         │   ← 28-36px bold text
│                  │
└──────────────────┘
    ↑
    80x60px minimum
    Rounded corners (12px)
    Theme-colored background
    Drop shadow on lift
```

### Word Card Types

| Type | Visual | Example |
|------|--------|---------|
| **Sight Word** | Plain themed background, large text | "the", "is", "can" |
| **Pictured Word** | Icon above text, subtle border | "🐱 cat", "🏠 house" |
| **Character Word** | Gold/special background, character image | "Chase", "Bluey" |
| **Punctuation** | Smaller card, distinct shape | ".", "?", "!" |

### Card States

| State | Visual Treatment |
|-------|-----------------|
| Default | Resting in word bank |
| Hover (desktop) | Slight lift, cursor pointer |
| Pressed | Scale to 0.95, darker shadow |
| Dragging | Scale to 1.1, strong shadow, follows finger |
| Placed | In slot, no shadow |
| Correct | Green glow, locked |
| Incorrect | Red shake, returns to bank |

---

## Sentence Slots

### Visual Design

```
Empty:     ┌─ ─ ─ ─┐    Dashed border, light fill
           │       │
           └─ ─ ─ ─┘

Hinted:    ┌───────┐    Ghost text visible (scaffolding)
           │  The  │    (semi-transparent)
           └───────┘

Filled:    ┌───────┐    Word card snapped in
           │  The  │    (full opacity)
           └───────┘

Correct:   ┌───────┐    Green glow effect
           │  The  │    (after validation)
           └───────┘
```

### Slot Sizing

- Slots are sized identically (largest word determines size)
- Punctuation slot is smaller (40x60px vs 80x60px)
- Consistent spacing (12px gap)
- Center-aligned in sentence area

---

## Scaffolding Levels

### Level 1: Heavy Scaffolding

**When Used**: First 5 missions of first campaign

**Visual**:
```
┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌─┐
│  The  │ │  dog  │ │  can  │ │  run  │ │.│   ← Ghost words
└───────┘ └───────┘ └───────┘ └───────┘ └─┘     (50% opacity)
```

**Behavior**:
- All correct words shown as ghosts
- Child matches word cards to ghosts
- Order is explicitly guided
- Success nearly guaranteed

### Level 2: Medium Scaffolding

**When Used**: Missions 6-15

**Visual**:
```
┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌─┐
│ BLUE  │ │  RED  │ │  RED  │ │GREEN │ │.│   ← Color-coded
└───────┘ └───────┘ └───────┘ └───────┘ └─┘     by word type
```

**Color Key**:
- Blue = Subject/noun
- Red = Verb/action
- Green = Object/descriptor
- Gray = Connector/article

**Behavior**:
- Slots show part-of-speech color
- Word cards show matching color hint
- Child learns sentence structure
- Multiple valid arrangements possible

### Level 3: Light Scaffolding

**When Used**: After first campaign

**Visual**:
```
┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌─┐
│  The  │ │       │ │       │ │       │ │.│   ← Only first
└───────┘ └───────┘ └───────┘ └───────┘ └─┘     word shown
```

**Behavior**:
- First word is shown/highlighted
- Rest of slots are empty
- Child must reason about order
- Builds independence

### Level 4: No Scaffolding

**When Used**: Boss missions, advanced play

**Visual**:
```
┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌─┐
│       │ │       │ │       │ │       │ │.│   ← All empty
└───────┘ └───────┘ └───────┘ └───────┘ └─┘
```

**Behavior**:
- No hints in slots
- Word cards in shuffled order
- Child relies on knowledge
- Full independence

---

## Validation

### AI-Powered Validation

> **CRITICAL**: Validation uses LLM (OpenAI/Gemini), NOT strict position matching.

**Why**:
- "The cat and dog run" = VALID
- "The dog and cat run" = ALSO VALID
- Both are grammatically correct
- Strict matching would incorrectly reject valid sentences

**Validation Flow**:

```
┌─────────────────────────────────────────────────────────────┐
│                    VALIDATION FLOW                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Child taps CHECK button                                 │
│                    ↓                                        │
│  2. UI shows "Checking..." spinner                          │
│                    ↓                                        │
│  3. API call to /api/ai/validate-sentence                   │
│     - Sends: submitted words, available words, context      │
│                    ↓                                        │
│  4. LLM evaluates:                                          │
│     - Grammatically correct?                                │
│     - Semantically meaningful?                              │
│     - Uses only available words?                            │
│                    ↓                                        │
│  5. Returns: { valid: boolean, encouragement: string }      │
│                    ↓                                        │
│  6. UI displays result                                      │
│     - Valid: Green glow, celebration                        │
│     - Invalid: Gentle shake, try again                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Latency Target**: < 500ms

**Fallback** (if API fails):
1. Check against pre-defined correct arrangements
2. Accept if matches any known valid answer
3. Log for admin review
4. Never block child's progress

### Validation API Request

```typescript
interface ValidateSentenceRequest {
  submittedWords: string[];    // ["The", "dog", "can", "run", "."]
  availableWords: string[];    // All words in word bank
  missionContext: string;      // "Help Chase cross the bridge"
  targetSentence?: string;     // Optional: expected answer
}

interface ValidateSentenceResponse {
  valid: boolean;
  reason?: string;             // "Words are out of order"
  encouragement: string;       // "So close! Try again!"
  suggestedFix?: string;       // For logging/debugging
}
```

### Validation Rules

| Rule | Example | Result |
|------|---------|--------|
| Grammatically correct | "The dog runs fast" | VALID |
| Grammatically wrong | "Dog the fast runs" | INVALID |
| Missing words | "The dog runs" (missing "fast") | INVALID |
| Extra words | "The big dog runs fast" (big not available) | INVALID |
| Alternative order | "Fast runs the dog" | INVALID (not natural) |
| Punctuation missing | "The dog runs fast" (no period) | INVALID |
| Punctuation wrong | "The dog runs fast?" | May be VALID (question) |

---

## Distractor Words

### Purpose

- Prevent pure pattern matching
- Add mild challenge
- Make correct choice meaningful

### Rules

| Rule | Detail |
|------|--------|
| Count | 1-2 distractors per sentence |
| Difficulty | Similar to target words |
| Type | Same part of speech when possible |
| Never | Words that would make sentence correct |

### Example

**Target**: "The cat is big."

**Word Bank**:
- The, cat, is, big, . (needed)
- dog, small (distractors)

**Why "dog"**: Could replace "cat" but makes different sentence
**Why "small"**: Opposite of "big", plausible choice

---

## Word Audio

### Play Triggers

| Action | Audio |
|--------|-------|
| Tap word in bank | Word is read aloud |
| Place word in slot | Word is read aloud |
| Remove word from slot | Word is read aloud |
| Hint shows word | Word is read aloud |
| Sentence correct | Full sentence read |

### Audio Loading

- Pre-load audio for current mission's words
- Lazy load from cache or generate on-demand
- See [Audio System](../audio/) for details

---

## Capitalization & Punctuation

### Capitalization

- First word of sentence: ALWAYS capitalized in slot
- Same word mid-sentence: lowercase
- Proper nouns (Chase, Bluey): always capitalized

**Example**:
- Slot 1: "The" (capital T)
- Slot 3: "the" (lowercase) if used again

**Implementation**: Word cards always show lowercase; slot applies capitalization.

### Punctuation

- Treated as separate draggable card
- Smaller card size (40x60px)
- Distinct visual (circle/square shape)
- Must be placed to complete sentence

**Available Punctuation**:
- Period (.) - most common
- Question mark (?) - for questions
- Exclamation mark (!) - for excitement

---

## Accessibility

| Feature | Implementation |
|---------|----------------|
| Motor | Tap-only mode (no drag required) |
| Visual | High contrast cards, no color-only info |
| Auditory | All words read aloud on interaction |
| Cognitive | Undo available, unlimited time |
| Screen Reader | ARIA labels, focus management |

---

← [Gameplay](./README.md) | [Feedback System →](./feedback-system.md)

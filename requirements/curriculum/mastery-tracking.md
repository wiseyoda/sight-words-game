# Mastery Tracking

← [Back to Curriculum](./README.md)

---

## Overview

Every word is tracked individually for each child. This enables personalized learning and accurate progress reporting.

---

## Tracking Metrics

### Per-Word Data

```typescript
type WordMastery = {
  id: string;
  playerId: string;
  wordId: string;

  // Interaction counts
  timesSeen: number;           // Total exposures
  timesCorrectFirstTry: number;  // No retries needed
  timesNeededRetry: number;    // 1+ retries
  timesNeededHint: number;     // Hint was used

  // Timestamps
  firstSeenAt: Date;
  lastSeenAt: Date;
  lastCorrectAt?: Date;

  // Calculated fields
  masteryLevel: 'new' | 'learning' | 'familiar' | 'mastered';
  accuracy: number;            // 0-100 percentage
  streakCurrent: number;       // Current consecutive correct
  streakBest: number;          // Best ever streak
};
```

---

## Mastery Levels

### Level Definitions

| Level | Criteria | Visual | Color |
|-------|----------|--------|-------|
| **New** | Seen 0-2 times | Gray dot | `#9E9E9E` |
| **Learning** | Seen 3-5×, <70% first-try | Yellow dot | `#FFC107` |
| **Familiar** | Seen 5+×, 70-90% first-try | Blue dot | `#2196F3` |
| **Mastered** | Seen 10+×, >90% first-try | Green star | `#4CAF50` |

### Level Transitions

```
┌─────────────────────────────────────────────────────────────┐
│                    MASTERY PROGRESSION                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│    NEW ───────────► LEARNING ───────────► FAMILIAR         │
│     │                  │                     │               │
│   0-2 seen          3-5 seen              5+ seen           │
│                    <70% accuracy         70-90% accuracy    │
│                                              │               │
│                                              ▼               │
│                                          MASTERED           │
│                                         10+ seen            │
│                                        >90% accuracy        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Regression Rules

Words can regress if performance drops:

| From | To | Trigger |
|------|-----|---------|
| Mastered | Familiar | Accuracy drops below 85% |
| Familiar | Learning | Accuracy drops below 65% |
| Learning | Learning | (stays until improvement) |

**Note**: Regression is rare and gradual. It takes consistent poor performance over multiple sessions.

---

## Accuracy Calculation

### Formula

```
accuracy = (timesCorrectFirstTry / timesSeen) * 100
```

### Weighted Recency

Recent performance matters more:

```
weightedAccuracy = (recentAccuracy * 0.6) + (historicalAccuracy * 0.4)
```

Where:
- `recentAccuracy` = last 5 exposures
- `historicalAccuracy` = all-time average

---

## Streak Tracking

### Current Streak

- Increments with each first-try correct
- Resets to 0 on any incorrect attempt
- Used for "hot streak" celebrations

### Best Streak

- Records highest ever streak
- Never decreases
- Achievement milestone at 10, 25, 50

### Streak Celebrations

| Streak | Celebration |
|--------|-------------|
| 3 | "Hot streak!" (small chime) |
| 5 | "On fire!" (medium celebration) |
| 10 | "UNSTOPPABLE!" (big celebration) |

---

## Exposure Timing

### Spaced Repetition Concept

Words are shown more or less frequently based on mastery:

| Mastery Level | Target Interval |
|---------------|-----------------|
| New | Every 1-2 missions |
| Learning | Every 2-3 missions |
| Familiar | Every 4-6 missions |
| Mastered | Every 8-12 missions |

### Priority Queue

When selecting words for a mission:

```typescript
function calculateWordPriority(word: WordMastery): number {
  const daysSinceLastSeen = getDaysSince(word.lastSeenAt);
  const targetInterval = getTargetInterval(word.masteryLevel);
  const overdue = daysSinceLastSeen / targetInterval;

  // Overdue words get higher priority
  // Lower mastery words also get boost
  return overdue * getMasteryMultiplier(word.masteryLevel);
}

function getMasteryMultiplier(level: MasteryLevel): number {
  switch (level) {
    case 'new': return 2.0;
    case 'learning': return 1.5;
    case 'familiar': return 1.0;
    case 'mastered': return 0.5;
  }
}
```

---

## Data Collection Points

### When We Record

| Event | Data Recorded |
|-------|---------------|
| Word appears in mission | `timesSeen++`, `lastSeenAt = now` |
| Correct on first try | `timesCorrectFirstTry++`, `streakCurrent++` |
| Correct after retry | `timesNeededRetry++`, `streakCurrent = 0` |
| Hint used | `timesNeededHint++` |
| Sentence complete | Batch update for all words |

### Privacy Considerations

- Data stored per-profile, not shared
- No PII collected
- Local to Vercel Postgres database
- Parent can export/delete anytime

---

## Progress Visualization

### Word Mastery Grid

```
┌─────────────────────────────────────────────────────────────┐
│                    WORD PROGRESS                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   PRE-PRIMER (40 words)                                     │
│   ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐  (10 mastered)                         │
│   🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵  (10 familiar)                         │
│   🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡  (10 learning)                         │
│   ⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪  (10 new)                               │
│                                                              │
│   PRIMER (52 words)                                          │
│   ⭐⭐⭐⭐⭐               (5 mastered)                       │
│   🔵🔵🔵🔵🔵🔵🔵🔵        (8 familiar)                       │
│   🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡  (12 learning)                     │
│   ⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪ (27 new)     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Individual Word Detail

```
┌─────────────────────────────────────────────────────────────┐
│                     WORD: "they"                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Status: 🟡 LEARNING                                        │
│                                                              │
│   Times Seen: 7                                              │
│   First-Try Correct: 4 (57%)                                │
│   Needed Retry: 2                                            │
│   Needed Hint: 1                                             │
│                                                              │
│   Current Streak: 2                                          │
│   Best Streak: 3                                             │
│                                                              │
│   First Seen: Nov 15, 2025                                  │
│   Last Seen: Nov 28, 2025                                   │
│                                                              │
│   To reach FAMILIAR:                                         │
│   → Need 70% accuracy (currently 57%)                       │
│   → Get 3 more first-try correct                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Parent Dashboard View

### Summary Stats

```
┌─────────────────────────────────────────────────────────────┐
│                    EMMA'S WORD MASTERY                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Total Words: 133                                           │
│                                                              │
│   ⭐ Mastered:  34 (26%) ████████░░░░░░░░░░░░░░░░░░░       │
│   🔵 Familiar:  28 (21%) ██████░░░░░░░░░░░░░░░░░░░░░       │
│   🟡 Learning:  18 (14%) █████░░░░░░░░░░░░░░░░░░░░░░       │
│   ⚪ New:       53 (40%) ████████████░░░░░░░░░░░░░░░       │
│                                                              │
│   This Week:                                                 │
│   • 3 words moved to Mastered                               │
│   • 5 words moved to Familiar                               │
│   • 12 new words introduced                                 │
│                                                              │
│   Words Needing Practice:                                    │
│   "they", "there", "where", "said", "come"                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema

```sql
CREATE TABLE word_mastery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id),
  word_id UUID NOT NULL REFERENCES words(id),

  -- Counts
  times_seen INT DEFAULT 0,
  times_correct_first_try INT DEFAULT 0,
  times_needed_retry INT DEFAULT 0,
  times_needed_hint INT DEFAULT 0,

  -- Streaks
  streak_current INT DEFAULT 0,
  streak_best INT DEFAULT 0,

  -- Timestamps
  first_seen_at TIMESTAMPTZ,
  last_seen_at TIMESTAMPTZ,
  last_correct_at TIMESTAMPTZ,

  -- Calculated (or computed on read)
  mastery_level VARCHAR(20) DEFAULT 'new',
  accuracy DECIMAL(5,2) DEFAULT 0,

  -- Meta
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(player_id, word_id)
);

-- Index for efficient queries
CREATE INDEX idx_word_mastery_player ON word_mastery(player_id);
CREATE INDEX idx_word_mastery_level ON word_mastery(player_id, mastery_level);
CREATE INDEX idx_word_mastery_last_seen ON word_mastery(player_id, last_seen_at);
```

---

← [Curriculum](./README.md) | [Adaptive Difficulty →](./adaptive-difficulty.md)

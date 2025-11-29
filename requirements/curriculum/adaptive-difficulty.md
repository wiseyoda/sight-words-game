# Adaptive Difficulty

← [Back to Curriculum](./README.md)

---

## Overview

The game automatically adjusts to the child's skill level. The goal is to keep them in the "flow" zone - challenged but not frustrated.

---

## Adaptation Philosophy

> **"Always make the child feel successful while gently pushing their limits."**

- Never too easy (boring)
- Never too hard (frustrating)
- Always achievable with effort
- Celebrate every success

---

## Detection: Struggling

### Triggers

| Signal | Threshold | Detection |
|--------|-----------|-----------|
| Repeated word misses | Same word wrong 3+ times recently | Per-word tracking |
| Heavy hint usage | 3+ hints in single mission | Per-mission tracking |
| Many retries | Average 3+ attempts per sentence | Per-mission tracking |
| Long pauses | 15+ seconds with no action | Real-time monitoring |
| Low star average | <1.5 stars over last 5 missions | Rolling average |

### Responses

| Trigger | Automatic Response |
|---------|-------------------|
| Word missed 3+ times | Add to "practice needed" list, increase frequency in next 5 missions |
| 3+ hints in mission | Next mission uses one level heavier scaffolding |
| Avg 3+ attempts/sentence | Insert "review mission" using mastered words only |
| Long pause (15 sec) | Hint button pulses, offer help |
| Low star average | Reduce sentence count (5→4→3), increase scaffolding |

### Example: Struggling Detection Flow

```
┌─────────────────────────────────────────────────────────────┐
│                STRUGGLING DETECTION                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Mission 7 Completed                                         │
│  • Used 4 hints                                              │
│  • Average 2.8 attempts per sentence                        │
│  • Earned 1 star                                             │
│                                                              │
│  ⚠️ Signals Detected:                                       │
│  • Heavy hint usage (threshold: 3)                          │
│  • High retry rate (threshold: 2)                           │
│                                                              │
│  🔧 Automatic Adjustments:                                  │
│  • Mission 8 scaffolding: Level 2 → Level 1 (ghost words)   │
│  • Mission 8 sentences: 4 → 3                               │
│  • Focus words: "they", "there" (missed most)               │
│                                                              │
│  No alert to parent (unless pattern continues 3+ sessions)  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Detection: Excelling

### Triggers

| Signal | Threshold | Detection |
|--------|-----------|-----------|
| Consistent 3 stars | 5+ missions in a row with 3 stars | Rolling count |
| All first-try | All sentences correct on first attempt | Per-mission |
| Fast completion | < 30 seconds per sentence average | Time tracking |
| Word mastered quickly | 5 first-try correct for new word | Per-word tracking |
| High overall accuracy | > 90% first-try over last 20 words | Rolling average |

### Responses

| Trigger | Automatic Response |
|---------|-------------------|
| 5 missions with 3 stars | Offer "Challenge Mode" toggle |
| All sentences first-try | "Super Reader!" celebration + bonus sticker chance |
| Fast completion | Subtle praise, log for parent |
| Word mastered quickly | Reduce frequency, add to "mastered" pool |
| High overall accuracy | Introduce harder word level sooner |

### Challenge Mode

When unlocked:

```
┌─────────────────────────────────────────────────────────────┐
│                    CHALLENGE MODE                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   You're doing AMAZING! Want an extra challenge?            │
│                                                              │
│   Challenge Mode means:                                      │
│   • Fewer hints                                              │
│   • More words per sentence                                 │
│   • Special challenge sticker if you get 3 stars!           │
│                                                              │
│   ┌─────────────────┐  ┌─────────────────┐                  │
│   │                 │  │                 │                   │
│   │  YES, BRING IT! │  │  MAYBE LATER    │                   │
│   │                 │  │                 │                   │
│   └─────────────────┘  └─────────────────┘                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

Challenge Mode effects:
- Scaffolding drops one level
- Sentences increase by 1
- Words per sentence increase by 1
- Special gold star border if 3 stars achieved

---

## Scaffolding Adjustment

### Scaffolding Levels

| Level | Visual Aid | When Used |
|-------|------------|-----------|
| 1 (Heavy) | Ghost words in all slots | Struggling or first missions |
| 2 (Medium) | Color-coded slots by part of speech | Default progression |
| 3 (Light) | First word only visible | After initial campaign |
| 4 (None) | Empty slots | Boss missions, challenge mode |

### Automatic Transitions

**Downgrade (easier)**:
- Current: Level 3, next: Level 2
- Trigger: 2+ hints used OR 2+ retries on 50%+ sentences

**Upgrade (harder)**:
- Current: Level 2, next: Level 3
- Trigger: 3 stars on 3 consecutive missions at current level

### Never Auto-Change

- From Level 4 (boss missions stay hard)
- During a mission (only between missions)
- More than one level at a time

---

## Word Selection

### Priority Algorithm

```typescript
function selectWordsForMission(
  player: PlayerProgress,
  missionWordCount: number
): Word[] {
  const wordPool = getAllAvailableWords(player.currentDifficulty);

  // Score each word
  const scored = wordPool.map(word => ({
    word,
    score: calculateWordScore(word, player)
  }));

  // Sort by score (highest priority first)
  scored.sort((a, b) => b.score - a.score);

  // Balance the selection
  return balanceWordSelection(scored, missionWordCount);
}

function calculateWordScore(word: Word, player: PlayerProgress): number {
  const mastery = getWordMastery(player.id, word.id);

  let score = 0;

  // Needs practice (struggling words)
  if (mastery.accuracy < 70 && mastery.timesSeen >= 3) {
    score += 100;  // Highest priority
  }

  // Overdue for review
  const daysSinceSeen = getDaysSince(mastery.lastSeenAt);
  const targetInterval = getTargetInterval(mastery.masteryLevel);
  if (daysSinceSeen > targetInterval) {
    score += 50 * (daysSinceSeen / targetInterval);
  }

  // New words (introduce gradually)
  if (mastery.timesSeen < 3) {
    score += 30;
  }

  // Mastered words (occasional review)
  if (mastery.masteryLevel === 'mastered') {
    score += 10;  // Low priority, but still included
  }

  return score;
}

function balanceWordSelection(
  scored: ScoredWord[],
  count: number
): Word[] {
  const selected: Word[] = [];

  // Ensure mix of levels
  const targets = {
    needsPractice: Math.ceil(count * 0.4),
    learning: Math.ceil(count * 0.3),
    review: Math.ceil(count * 0.3)
  };

  // Fill from each category
  // ... implementation details ...

  return selected;
}
```

---

## Sentence Complexity

### Complexity Factors

| Factor | Easy | Medium | Hard |
|--------|------|--------|------|
| Word count | 3-4 | 4-5 | 5-7 |
| Unique words | All familiar | 1-2 new | 2-3 new |
| Distractors | 1 | 2 | 2-3 |
| Sentence structure | SVO only | SVO + adjective | Complex |

### Automatic Adjustment

Based on performance:

| Performance | Next Mission Adjustment |
|-------------|------------------------|
| < 1.5 star avg | -1 word per sentence, -1 distractor |
| 1.5-2.5 star avg | No change (optimal zone) |
| > 2.5 star avg | +1 word per sentence (if not max) |

---

## Session-Level Adaptation

### Within-Session Adjustments

These happen in real-time during play:

| Observation | Immediate Response |
|-------------|-------------------|
| 3rd failed attempt on sentence | Auto-offer hint |
| 15 seconds no action | Pulse hint button |
| 3 sentences with hints | Next sentence slightly easier |
| 3 sentences first-try | Next sentence slightly harder |

### Between-Session Adjustments

These happen when child starts a new session:

| Pattern (last 3 sessions) | Adjustment |
|---------------------------|------------|
| Avg < 1.5 stars | Drop scaffolding level |
| Avg > 2.5 stars | Increase scaffolding level |
| Many quits mid-mission | Shorter missions |
| Long sessions (>20 min) | No change (enjoying!) |

---

## Parent Override

### Settings Available

```
┌─────────────────────────────────────────────────────────────┐
│              DIFFICULTY SETTINGS                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Adaptation Mode:                                            │
│  (•) Automatic (recommended)                                 │
│  ( ) Manual control                                          │
│                                                              │
│  If Manual:                                                  │
│  Scaffolding Level: [ Level 2 (Medium) ▼ ]                  │
│  Sentences per Mission: [ 4 ▼ ]                             │
│  Words per Sentence: [ 5 ▼ ]                                │
│                                                              │
│  Always Available:                                           │
│  [ ] Enable Challenge Mode                                   │
│  [ ] Disable hints entirely                                  │
│  [ ] Shorter sessions (10 min warning)                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Logging

### What We Track

For each mission:
- Stars earned
- Hints used (total and per sentence)
- Attempts per sentence
- Time per sentence
- Words seen and results
- Scaffolding level used
- Any adjustments made

### For Analytics

```typescript
type MissionAttempt = {
  id: string;
  playerId: string;
  missionId: string;
  startedAt: Date;
  completedAt?: Date;

  // Performance
  starsEarned: 1 | 2 | 3;
  totalHintsUsed: number;
  totalRetries: number;
  averageTimePerSentence: number;

  // Adaptation state
  scaffoldingLevel: 1 | 2 | 3 | 4;
  wasAdjusted: boolean;
  adjustmentReason?: string;

  // Sentences
  sentenceAttempts: SentenceAttempt[];
};
```

---

## Alerts to Parents

### When to Alert

| Situation | Alert Level | Message |
|-----------|-------------|---------|
| Struggling 3+ sessions | Info | "Emma might need some extra help with 'they' and 'there'" |
| Excelling consistently | Celebrate | "Emma is a superstar! Consider unlocking Challenge Mode!" |
| Specific word issue | Info | "Emma has trouble with 'where' - it's confused with 'were'" |
| Significant progress | Celebrate | "5 new words mastered this week!" |

### Alert Delivery

- Dashboard notification (badge)
- Summary in weekly progress email (if enabled)
- Never intrusive or alarming

---

← [Curriculum](./README.md)

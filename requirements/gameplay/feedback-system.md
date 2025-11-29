# Feedback & Hint System

← [Back to Gameplay](./README.md)

---

## Design Philosophy

> **"Encouragement over Punishment"**
>
> Every interaction should build confidence. Children should feel smart, capable, and motivated to continue.

---

## Hint System

### Hint Button

**Location**: Top-right of game screen (always visible)

**Icon**: Lightbulb (💡)

**States**:
| State | Visual | Behavior |
|-------|--------|----------|
| Default | Dim lightbulb | Tap to use hint |
| Pulsing | Glowing, gentle pulse | Auto-activates after 15 sec inactivity |
| Cooldown | Grayed out | 5-second wait between uses |
| Disabled | Hidden | Scaffolding level 4 (boss mode) |

### Progressive Hints

Hints escalate with each tap:

**Hint Level 1: First Word Highlight**
```
┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐
│  The  │ │       │ │       │ │       │
└───────┘ └───────┘ └───────┘ └───────┘
    ↑
   GLOW (golden outline, gentle pulse)
```
- First word in word bank glows
- Helps child know where to start
- Minimal assistance

**Hint Level 2: Ghost Outline**
```
┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐
│  The  │ │  dog  │ │  can  │ │  run  │
└───────┘ └───────┘ └───────┘ └───────┘
    ↑         ↑         ↑         ↑
   All ghost words visible (50% opacity)
```
- Shows all correct positions
- Child just needs to match
- Medium assistance

**Hint Level 3: Audio Playback**
```
🔊 "The dog can run."
```
- Full sentence read aloud
- Child hears the correct answer
- Maximum assistance

### Hint Impact on Stars

| Hints Used | Maximum Stars |
|------------|---------------|
| 0 | ⭐⭐⭐ (3) |
| 1 | ⭐⭐ (2) |
| 2+ | ⭐ (1) |

**Important**: Stars are NEVER zero. Every completion earns at least 1 star.

### Auto-Hint Triggers

| Trigger | Response |
|---------|----------|
| 15 seconds no action | Hint button pulses |
| 3 failed attempts | "Need a hint?" popup |
| 30 seconds no progress | Hint button pulses strongly |

**Auto-Offer UI**:
```
┌─────────────────────────────────────┐
│                                      │
│   Would you like a little help?     │
│                                      │
│   ┌─────────────┐  ┌─────────────┐  │
│   │  Yes! 💡    │  │  I got it!  │  │
│   └─────────────┘  └─────────────┘  │
│                                      │
└─────────────────────────────────────┘
```

---

## Correct Answer Feedback

### Immediate Response (< 100ms)

1. **Sound**: Cheerful chime (short, bright)
2. **Visual**: Word cards glow green
3. **Animation**: Cards "lock" in place with subtle bounce

### Celebration (100-500ms)

4. **Character**: Does happy animation (jump, cheer, thumbs up)
5. **Particles**: Confetti or sparkles burst from sentence
6. **Voice**: Random encouraging phrase

### Voice Phrases

Theme-agnostic:
- "You did it!"
- "Amazing reading!"
- "You're a superstar!"
- "Perfect!"
- "Great job!"
- "You're so smart!"
- "Fantastic!"

Theme-specific (Paw Patrol):
- "Paw-some!"
- "You're on the case!"
- "No job too big, no pup too small!"

Theme-specific (Bluey):
- "For real life!"
- "Nice play!"
- "Wackadoo!"
- "Dance mode unlocked!"

Theme-specific (Marvel):
- "Suit up, hero!"
- "Mission accomplished!"
- "Avengers assemble!"
- "Hulk smash that word!"

### Post-Celebration (500ms+)

7. **Progress**: Indicator advances (dot fills, bar grows)
8. **Visual Progress**: Story element advances (bridge piece added, etc.)
9. **Next Prompt**: Smooth transition to next sentence (or mission complete)

---

## Incorrect Answer Feedback

### Design Principle

> **Never punish, always guide.**
>
> An incorrect answer is a learning moment, not a failure.

### Immediate Response (< 100ms)

1. **Sound**: Soft "boing" (NOT buzzer, NOT negative)
2. **Visual**: Incorrect word cards gently shake
3. **Animation**: Cards float back to word bank

### Encouragement (100-500ms)

4. **Character**: Shows supportive pose (thumbs up, encouraging nod)
5. **Voice**: Random encouraging phrase

### Voice Phrases

- "Almost! Try again!"
- "So close! You've got this!"
- "Let's try once more!"
- "Good try! Keep going!"
- "You're learning!"
- "Almost there!"

### Visual Feedback

**What shakes**:
- ONLY the words in wrong positions
- Words in correct positions stay put
- Helps child understand WHAT was wrong

**How it shakes**:
- Gentle horizontal wobble (3-5 pixels)
- 2-3 oscillations
- 300ms duration
- Ease-out timing

### Return Animation

- Cards float smoothly back to word bank
- Staggered timing (50ms between cards)
- No abrupt movements
- Bank reshuffles to original positions

### After Multiple Attempts

| Attempt | Response |
|---------|----------|
| 1st incorrect | Standard feedback |
| 2nd incorrect | Slightly longer encouragement |
| 3rd incorrect | Auto-offer hint popup |
| 4th+ incorrect | Hint button pulses continuously |

---

## Mission Complete Celebration

### Trigger

All sentences in mission completed successfully.

### Sequence

**1. Sentence Lock (0-500ms)**
- Final sentence glows gold
- "Complete!" text appears above

**2. Character Celebration (500-1500ms)**
- Character does elaborate animation
- Victory pose, jump, or dance
- Theme-specific (Paw Patrol: Ryder claps, Bluey: Bluey dances)

**3. Stars Reveal (1500-2500ms)**
```
         ⭐
       ↗    ↖
      ⭐  →  ⭐

"You earned 3 stars!"
```
- Stars fly in one by one
- Sound effect for each star
- Ascending pitch (do-re-mi)

**4. Unlock Reveal (2500-3500ms)**
*If applicable*
```
┌────────────────────────────┐
│    🎉 NEW UNLOCK! 🎉      │
│                            │
│      [Rocket Avatar]       │
│                            │
│   "Rocket" is now yours!   │
└────────────────────────────┘
```
- Card flip animation
- Sparkle effect
- Fanfare sound

**5. Continue Options (3500ms+)**
```
┌─────────────────────────────────────┐
│                                      │
│    What would you like to do?       │
│                                      │
│   ┌─────────────┐  ┌─────────────┐  │
│   │   CONTINUE  │  │  STORY MAP  │  │
│   │   (next →)  │  │   (🗺️)     │  │
│   └─────────────┘  └─────────────┘  │
│                                      │
└─────────────────────────────────────┘
```

---

## Campaign Complete (Boss Victory)

### Trigger

Boss mission completed (end of campaign).

### Extended Celebration

Everything from mission complete, PLUS:

**1. Story Conclusion (2 seconds)**
- Narrative outro plays
- "You saved Adventure Bay!"
- Character delivers final line

**2. Fireworks (2 seconds)**
- Larger particle effects
- Multiple burst points
- Epic music swell

**3. Stats Summary (3 seconds)**
```
┌────────────────────────────────────────┐
│         CAMPAIGN COMPLETE!             │
│                                         │
│   ⭐ Stars Earned: 38                   │
│   📖 Words Practiced: 45                │
│   ✨ New Words Mastered: 12             │
│   🎯 Perfect Missions: 5                │
│                                         │
└────────────────────────────────────────┘
```

**4. Next Campaign Tease (3 seconds)**
```
┌────────────────────────────────────────┐
│                                         │
│   COMING NEXT:                         │
│                                         │
│   [Preview Image]                      │
│                                         │
│   "Bluey: Backyard Adventures"         │
│   (tapping reveals more)               │
│                                         │
└────────────────────────────────────────┘
```

---

## Sound Design

### Correct Sounds

| Event | Sound | Duration | Feel |
|-------|-------|----------|------|
| Word placed | Soft pop | 100ms | Satisfying |
| Sentence correct | Chime | 500ms | Joyful |
| Mission complete | Fanfare | 1500ms | Triumphant |
| Star earned | Ding | 200ms | Rewarding |

### Incorrect Sounds

| Event | Sound | Duration | Feel |
|-------|-------|----------|------|
| Wrong order | Soft boing | 300ms | Gentle |
| Card returns | Whoosh | 200ms | Neutral |

### NEVER Use

- Buzzers
- Error beeps
- Negative stings
- Sad tones
- Anything that sounds like "wrong"

---

## Accessibility Considerations

### Visual Feedback

- Never rely on color alone
- Correct: Green + glow + locked position
- Incorrect: Red + shake + return animation
- All states distinguishable by shape/animation

### Audio Feedback

- All feedback has audio component
- Visual captions for voice phrases
- Can be enabled in accessibility settings

### Timing

- Animations can be reduced (prefers-reduced-motion)
- Feedback duration adjustable
- No time-sensitive responses required

---

← [Gameplay](./README.md) | [Mini-Games →](./mini-games.md)

# Story Map

← [Back to Progression](./README.md)

---

## Overview

A visual world map showing the adventure path. Inspired by Super Mario World and Candy Crush.

---

## Visual Design

```
┌─────────────────────────────────────────────────────────────┐
│                    ADVENTURE BAY (Paw Patrol)               │
│                                                              │
│                        [🎮]                                  │
│                         │                                    │
│    [🎁]───[⭐]───[⭐]───[⭐]───[🎁]───[⭐]───[⭐]───[👑]     │
│      │                                                       │
│   START                                              BOSS    │
│                                                              │
│  Legend:                                                     │
│  [⭐] Play Node - Standard mission (earned stars shown)     │
│  [🎁] Treasure Node - Unlock reward                          │
│  [🎮] Mini-Game Node - Unlocked game                         │
│  [👑] Boss Node - Chapter finale                             │
│  [🔒] Locked - Complete previous to unlock                   │
│                                                              │
│  Current Position: Pulsing glow                              │
│  Completed: Filled with earned stars                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Node Types

### Play Node (⭐)

- Standard mission (3-5 sentences)
- Shows earned stars (0-3)
- Tap to replay for better stars
- Most common node type (70%)

```
┌─────────┐       ┌─────────┐
│         │       │  ⭐⭐⭐  │
│   ⭐    │  →→   │  Play   │
│ Locked  │       │ Complete│
└─────────┘       └─────────┘
```

### Treasure Node (🎁)

- No gameplay required
- Automatic reward unlock
- Celebration animation
- Every 3rd node (roughly)

```
┌─────────┐       ┌─────────┐
│         │       │   🎁    │
│   🎁    │  →→   │ Opened! │
│ Locked  │       │ +Avatar │
└─────────┘       └─────────┘
```

### Mini-Game Node (🎮)

- Unlocks reinforcement game
- Can replay anytime after unlock
- 2 per campaign

```
┌─────────┐       ┌─────────┐
│         │       │   🎮    │
│   🎮    │  →→   │  BINGO  │
│ Locked  │       │ Play!   │
└─────────┘       └─────────┘
```

### Boss Node (👑)

- Harder mission (5-7 sentences)
- Fewer hints available
- Epic celebration on completion
- Unlocks next campaign
- End of each campaign

```
┌─────────┐       ┌─────────┐
│         │       │  ⭐⭐⭐  │
│   👑    │  →→   │   👑    │
│  BOSS   │       │CHAMPION!│
└─────────┘       └─────────┘
```

---

## Map Navigation

### Camera Behavior

- Map scrolls/pans to follow progress
- Pinch to zoom (if map is large)
- Auto-center on current node when entering
- Smooth animations between views

### Interaction

| Action | Result |
|--------|--------|
| Tap locked node | Gentle shake, show "Complete previous first!" |
| Tap unlocked node | Start mission or replay |
| Tap completed node | "Replay for more stars?" option |
| Tap mini-game node | Enter mini-game |
| Tap treasure (unopened) | Open animation + reward |

### Accessibility

- Nodes are large touch targets (64px+)
- Current node pulses for visibility
- Path between nodes is clear
- Audio announces node type on focus

---

## Progress Persistence

### What Saves

- Highest stars per node
- Unlock status per node
- Current position (last played)
- Total stars

### Replay Behavior

- Can replay any completed mission
- New star count replaces only if higher
- Never lose progress by replaying

---

## Visual Polish

### Animations

| Element | Animation |
|---------|-----------|
| Current node | Gentle pulse/glow |
| Newly unlocked | Sparkle + bounce |
| Path revealed | "Drawing" animation |
| Boss unlocked | Dramatic reveal |

### Theme Integration

Each theme has unique map visuals:
- **Paw Patrol**: Adventure Bay aerial view
- **Bluey**: Backyard/neighborhood
- **Marvel**: Galaxy/space

---

## Map Data Model

```typescript
type StoryMapNode = {
  id: string;
  campaignId: string;
  position: { x: number; y: number };
  type: 'play' | 'treasure' | 'minigame' | 'boss';
  missionId?: string;        // For play/boss nodes
  minigameId?: string;       // For minigame nodes
  unlockRewardId?: string;   // For treasure nodes
  unlockRequirement: string; // Previous node ID
  order: number;             // For linear progression
};

type PlayerMapProgress = {
  playerId: string;
  campaignId: string;
  nodeProgress: Record<string, {
    unlocked: boolean;
    completed: boolean;
    starsEarned?: 1 | 2 | 3;
    completedAt?: Date;
  }>;
  currentNodeId: string;
};
```

---

← [Progression](./README.md) | [Unlockables →](./unlockables.md)

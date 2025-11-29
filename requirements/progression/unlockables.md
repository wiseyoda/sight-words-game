# Unlockables & Rewards

← [Back to Progression](./README.md)

---

## Avatar System

### Starter Avatars (Default)

| Avatar | Visual | Available |
|--------|--------|-----------|
| Star | Yellow star with happy face | Default |
| Heart | Pink heart with smile | Default |

### Unlockable Avatars

| Avatar | Visual | Unlock Condition |
|--------|--------|------------------|
| Rocket | Cartoon rocket ship | Complete 5 missions |
| Rainbow | Colorful rainbow arc | Complete 10 missions |
| Crown | Golden crown | Complete first campaign |
| Lightning | Blue lightning bolt | Complete 20 missions |
| Diamond | Sparkly diamond | Complete any 2 campaigns |
| Champion Trophy | Golden trophy | Earn 100 total stars |

### Avatar Selection UI

```
┌─────────────────────────────────────────────────────────────┐
│                  CHOOSE YOUR AVATAR                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐    │
│   │  ⭐ │  │  💖 │  │  🚀 │  │  🌈 │  │  🔒 │  │  🔒 │    │
│   └─────┘  └─────┘  └─────┘  └─────┘  └─────┘  └─────┘    │
│    Star    Heart   Rocket  Rainbow  Crown   Diamond       │
│    [✓]                                                      │
│                                                              │
│   Locked avatars show unlock condition on tap               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Sticker Collection

### Sticker Categories

| Category | Source | Count |
|----------|--------|-------|
| **Theme Stickers** | Treasure nodes | 6-8 per theme |
| **Achievement Stickers** | Milestones | 10+ |
| **Special Stickers** | Boss completion | 1 per campaign |

### Theme Stickers (Example: Paw Patrol)

| Sticker | Unlock |
|---------|--------|
| Chase badge | Mission 3 treasure |
| Marshall badge | Mission 6 treasure |
| Skye badge | Mission 9 treasure |
| Rubble badge | Achievement (10 stars) |
| Rocky badge | Achievement (20 stars) |
| Zuma badge | Mission 12 treasure |
| Paw Patrol logo | Boss complete |

### Achievement Stickers

| Sticker | Name | Unlock |
|---------|------|--------|
| 🎯 | First Mission | Complete 1 mission |
| ⭐ | Rising Star | Earn 10 total stars |
| 🌟 | Shining Star | Earn 25 total stars |
| 💫 | Super Star | Earn 50 total stars |
| 🏆 | Word Champion | Earn 100 total stars |
| 📖 | First Words | Master 10 words |
| 📚 | Word Expert | Master 50 words |
| 🧠 | Word Genius | Master all 133 words |
| 🔥 | Hot Streak | 5 correct in a row |
| ⚡ | Lightning Fast | Complete mission in < 2 min |

### Sticker Book UI

```
┌─────────────────────────────────────────────────────────────┐
│                    STICKER BOOK                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   PAW PATROL (4/7)                                          │
│   ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐               │
│   │ ✓ │ │ ✓ │ │ ✓ │ │ ✓ │ │ ? │ │ ? │ │ ? │               │
│   └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘               │
│                                                              │
│   ACHIEVEMENTS (6/10)                                       │
│   ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ...    │
│   │ ✓ │ │ ✓ │ │ ✓ │ │ ✓ │ │ ✓ │ │ ✓ │ │ ? │ │ ? │        │
│   └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘        │
│                                                              │
│   Total: 10/17 stickers collected                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Stars System

### Earning Stars

| Performance | Stars | Criteria |
|-------------|-------|----------|
| Perfect | ⭐⭐⭐ | All first-try, no hints |
| Great | ⭐⭐ | 1-2 retries OR 1 hint |
| Good | ⭐ | 3+ retries OR 2+ hints |

**Important**: Minimum 1 star for completion. Never zero.

### Star Properties

- **Permanent**: Once earned, never lost
- **Cumulative**: Add up across all missions
- **Per-Mission Max**: 3 stars per mission
- **Improvable**: Replay to earn more stars

### Star Milestones

| Milestone | Stars | Celebration |
|-----------|-------|-------------|
| First Star | 1 | "You got a star!" |
| Ten Stars | 10 | Special animation |
| Twenty-Five | 25 | Achievement sticker |
| Fifty Stars | 50 | Achievement sticker |
| One Hundred | 100 | Trophy avatar unlock |
| Two Hundred | 200 | Ultimate celebration |

### Star Display

Stars appear throughout the app:
- **Story Map**: Per-node stars
- **Main Menu**: Total star count
- **Profile**: Total + breakdown
- **Mission Complete**: Stars earned

---

## Unlock Notifications

### In-Game Notification

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│              🎉 NEW UNLOCK! 🎉                              │
│                                                              │
│          ┌─────────────────────┐                            │
│          │                     │                             │
│          │    [Avatar/Sticker] │                             │
│          │       Image         │                             │
│          │                     │                             │
│          └─────────────────────┘                            │
│                                                              │
│           "Rocket Avatar Unlocked!"                         │
│                                                              │
│              [AWESOME!] [USE NOW]                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Animation Sequence

1. Confetti burst
2. Card flip reveal
3. Item sparkle
4. Fanfare sound
5. Name announcement
6. Buttons appear

---

## Unlock Data Model

```typescript
type Avatar = {
  id: string;
  name: string;
  imageUrl: string;
  unlockCondition: {
    type: 'default' | 'missions' | 'stars' | 'campaign' | 'words';
    value?: number;
    campaignId?: string;
  };
};

type Sticker = {
  id: string;
  name: string;
  imageUrl: string;
  category: 'theme' | 'achievement' | 'special';
  themeId?: string;
  unlockCondition: {
    type: 'mission' | 'stars' | 'words' | 'streak' | 'campaign';
    value?: number;
    missionId?: string;
  };
};

type PlayerUnlocks = {
  playerId: string;
  currentAvatarId: string;
  unlockedAvatarIds: string[];
  unlockedStickerIds: string[];
  totalStars: number;
};
```

---

## Future Unlockables

### Potential Additions

- **Backgrounds**: Customize profile screen
- **Card Skins**: Different word card styles
- **Music Packs**: Different background music
- **Voice Packs**: Different TTS voices
- **Effects**: Different celebration animations

### Seasonal Events

- Holiday-themed stickers
- Limited-time challenges
- Special avatars

---

← [Progression](./README.md)

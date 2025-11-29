# Design Principles

← [Back to UX Design](./README.md)

---

## Child-First Design

Every decision optimizes for a 5-year-old user who:
- Cannot read instructions
- Has developing fine motor skills
- Has a short attention span (5-10 minutes focused)
- Needs constant positive reinforcement
- May get frustrated easily

---

## The Seven Principles

### 1. Large Touch Targets

```
┌──────────────────────────────────────┐
│                                      │
│   BAD (too small)    GOOD (sized)    │
│                                      │
│   ┌────┐             ┌──────────┐    │
│   │ go │             │          │    │
│   └────┘             │    go    │    │
│   (40x30)            │          │    │
│                      └──────────┘    │
│                      (80x60px)       │
│                                      │
└──────────────────────────────────────┘
```

| Element | Minimum Size | Preferred Size |
|---------|--------------|----------------|
| Word cards | 64x64px | 80x60px |
| Action buttons | 48x48px | 64x48px |
| Nav icons | 44x44px | 56x56px |
| Close/back | 44x44px | 48x48px |

### 2. Simple Navigation

**Maximum 2 taps to any screen from main menu.**

```
Main Menu
├── Play → Theme Select → Story Map → Mission
├── Stickers → Sticker Book
├── Mini-Games → Game Select → Game
└── Settings → (Parent Gate) → Admin Dashboard
```

### 3. No Reading Required

All navigation uses:
- **Icons** - Universally understood symbols
- **Audio** - Voice announces options
- **Color** - Consistent meaning
- **Animation** - Shows interactivity

| Action | Visual | Audio |
|--------|--------|-------|
| Play | ▶️ button | "Play!" voice |
| Stickers | 📖 book icon | "Stickers!" voice |
| Settings | ⚙️ gear | (no audio - parent) |
| Back | ⬅️ arrow | (click sound) |

### 4. Immediate Feedback

| Interaction | Response Time | Feedback |
|-------------|---------------|----------|
| Tap | < 50ms | Visual press state |
| Complete action | < 100ms | Animation + sound |
| API call | < 500ms | Loading indicator |

**No silent waits.** If something takes time, show progress.

### 5. Forgiving Input

| Mistake | Recovery |
|---------|----------|
| Tap wrong word | Tap again to undo |
| Place in wrong slot | Tap to return |
| Want to restart | Clear all button |
| Accidental back | Confirm dialog |

### 6. Safe Areas

Account for device-specific elements:

```
┌─────────────────────────────────────────────────────────────┐
│ ← Status bar (iOS) / Notch area                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                                                      │   │
│   │                    SAFE AREA                        │   │
│   │               (content goes here)                   │   │
│   │                                                      │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│ ← Home indicator (iOS) / Navigation bar                     │
└─────────────────────────────────────────────────────────────┘
```

### 7. No External Links

| Allowed | Forbidden |
|---------|-----------|
| Internal navigation | URLs |
| In-app content | App Store links |
| Parent gate content | Social media |
| - | Advertisements |
| - | External videos |

---

## Typography

### Font Selection

| Priority | Font | Fallback |
|----------|------|----------|
| 1 | Atkinson Hyperlegible | - |
| 2 | Nunito | - |
| 3 | Comic Neue | - |
| System | system-ui | sans-serif |

**Why these fonts:**
- Rounded letterforms (friendly)
- Clear letter distinction (a/o, l/I/1)
- Designed for readability
- Free/open source

### Size Scale

| Element | Size | Line Height |
|---------|------|-------------|
| Word cards | 32px | 1.2 |
| Headings (H1) | 28px | 1.3 |
| Subheadings (H2) | 24px | 1.3 |
| Body | 20px | 1.4 |
| Labels | 16px | 1.4 |
| Small text | 14px | 1.4 |

### Rules

- **No ALL CAPS** except single emphasis words
- **No italics** for body text
- **Bold for emphasis** sparingly
- **Left-align** everything (no justified)
- **Generous spacing** between elements

---

## Color Usage

### Never Color-Only Information

```
BAD:  Green = correct, Red = wrong (relies on color)
GOOD: Green + ✓ = correct, Red + shake = wrong (redundant signals)
```

### Contrast Requirements

| Text Type | Ratio | Example |
|-----------|-------|---------|
| Normal text | 4.5:1 | Dark on light |
| Large text (24px+) | 3:1 | Headings |
| UI components | 3:1 | Buttons, cards |
| Decorative | No requirement | Backgrounds |

### Consistent Meaning

| Color | Meaning | Usage |
|-------|---------|-------|
| Green | Success/correct | Correct answers |
| Yellow | Caution/learning | Progress state |
| Blue | Information/neutral | Links, hints |
| Gold | Special/reward | Stars, unlocks |
| Gray | Disabled/locked | Unavailable |

---

## Animation Guidelines

### Purpose

Animations should:
- Guide attention
- Confirm actions
- Provide delight
- Never distract

### Duration

| Animation | Duration | Easing |
|-----------|----------|--------|
| Button press | 100ms | ease-out |
| Card movement | 200ms | ease-in-out |
| Screen transition | 300ms | ease-in-out |
| Celebration | 500-1000ms | custom bounce |

### Accessibility

- Respect `prefers-reduced-motion`
- Provide toggle in settings
- Essential animations still work (just faster)

---

## Sound Design Principles

### Audio Hierarchy

| Priority | Type | Example |
|----------|------|---------|
| 1 | Voice | Word pronunciation |
| 2 | Feedback | Correct/incorrect |
| 3 | Effects | Card sounds |
| 4 | Music | Background ambient |

### Rules

- Never play multiple voices simultaneously
- Effects should not mask voice
- Music always lowest volume
- All audio independently controllable

---

← [UX Design](./README.md) | [Screen Layouts →](./screen-layouts.md)

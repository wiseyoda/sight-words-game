# Narrative Themes

← [Back to Index](../README.md)

---

## Overview

Themes are complete visual and narrative "skins" for the game experience. Each theme provides:

- **Visual Identity**: Colors, fonts, backgrounds
- **Characters**: Images, names, vocabulary
- **Narrative**: Plot, mission intros/outros
- **Audio**: Music, SFX, voice lines
- **Campaigns**: Full mission progressions

---

## Documents in This Section

| Document | Description |
|----------|-------------|
| [Paw Patrol](./paw-patrol.md) | Adventure Bay Rescue theme |
| [Bluey](./bluey.md) | Backyard Adventures theme |
| [Marvel Avengers](./marvel-avengers.md) | Word Warriors theme |
| [Custom Themes](./custom-themes.md) | AI-generated theme guide |

---

## Theme Engine Architecture

### What Themes Control

| Layer | Theme Customization |
|-------|---------------------|
| **Colors** | Primary, secondary, accent, backgrounds, text |
| **Typography** | Font family (within child-safe options) |
| **Backgrounds** | Story map, game screen, menus |
| **Characters** | Images, names, special vocabulary |
| **Audio** | Background music, SFX pack, feedback phrases |
| **Narrative** | Campaign plot, mission intros/outros |
| **Cards** | Card styling, character card treatment |

### Theme Data Structure

```typescript
type Theme = {
  id: string;
  name: string;                    // "Paw Patrol"
  displayName: string;             // "Paw Patrol: Adventure Bay Rescue"

  palette: {
    primary: string;               // Main UI color
    secondary: string;             // Secondary accents
    accent: string;                // Highlights, CTAs
    background: string;            // Page backgrounds
    cardBackground: string;        // Word card bg
    text: string;                  // Primary text
    success: string;               // Correct feedback
    special: string;               // Character cards
  };

  characters: ThemeCharacter[];

  assets: {
    logo?: string;                 // Theme logo
    background: string;            // Game screen bg
    mapBackground: string;         // Story map bg
    sfxPack: string;               // Audio sprite URL
    musicTrack?: string;           // Background music
  };

  feedbackPhrases: {
    correct: string[];             // Success phrases
    encourage: string[];           // Retry phrases
    celebrate: string[];           // Mission complete
  };

  isActive: boolean;               // Visible in picker
  isCustom: boolean;               // User-created
};
```

---

## Launch Themes (MVP)

### Quick Comparison

| Theme | Target Audience | Complexity | Palette |
|-------|-----------------|------------|---------|
| **Paw Patrol** | Ages 4-6 | Entry-level | Bright, primary |
| **Bluey** | Ages 4-7 | Mid-range | Pastel, warm |
| **Marvel Avengers** | Ages 5-7 | Advanced | Bold, dramatic |

### Priority Order

1. **Paw Patrol** - Most universal appeal for age group
2. **Bluey** - Strong alternative, different aesthetic
3. **Marvel** - For kids who need more "cool" factor

---

## Phase II Themes

| Theme | Plot Hook | Characters | Target |
|-------|-----------|------------|--------|
| **Frozen** | Cast word-spells to melt ice | Elsa, Anna, Olaf, Kristoff | Girls 4-7 |
| **Peppa Pig** | Words power muddy puddle jumps | Peppa, George, family | Ages 3-5 |
| **PJ Masks** | Night missions, power gadgets | Catboy, Owlette, Gekko | Ages 4-6 |
| **Mickey Mouse** | Find Mousketools with words | Mickey, Minnie, gang | Ages 3-6 |
| **Super Mario** | Build word-platforms | Mario, Luigi, Peach | Ages 5-8 |

---

## Future Themes

**Preschool-focused**:
- Cocomelon
- Blippi
- Daniel Tiger
- Gabby's Dollhouse
- Sesame Street

**Adventure-focused**:
- Toy Story
- Cars
- Minions
- Sonic
- Pokémon

**Classics**:
- SpongeBob
- Trolls
- Lilo & Stitch
- Finding Nemo

---

## Theme Selection UI

```
┌─────────────────────────────────────────────────────────────┐
│                    CHOOSE YOUR ADVENTURE                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│   │             │  │             │  │             │         │
│   │ [Paw Patrol │  │  [Bluey     │  │  [Avengers  │         │
│   │   Logo]     │  │   Logo]     │  │   Logo]     │         │
│   │             │  │             │  │             │         │
│   │  Adventure  │  │  Backyard   │  │    Word     │         │
│   │    Bay      │  │ Adventures  │  │  Warriors   │         │
│   │             │  │             │  │             │         │
│   │ ⭐⭐⭐ 24★  │  │ ⭐⭐ 12★    │  │ 🔒 Locked   │         │
│   └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                              │
│              [+ Create Custom Theme] (Admin)                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Theme Switching

### When Can Themes Switch?

- **From Map**: Any time (each theme has own map)
- **Mid-Campaign**: Returns to theme's map position
- **Progress**: Saved per-theme, not global

### What Transfers Between Themes?

| Transfers | Doesn't Transfer |
|-----------|------------------|
| Word mastery | Campaign progress |
| Total stars | Mission stars |
| Avatars | Theme-specific stickers |
| Stickers (all) | Current position |
| Player profile | - |

---

## Legal Note

> **IP Usage**: All licensed themes are for **private family use only**.
>
> This application will not be publicly distributed. If future public release is desired, original characters and themes will be created.

---

← [Back to Index](../README.md) | [Paw Patrol →](./paw-patrol.md)

# Accessibility

← [Back to UX Design](./README.md)

---

## Accessibility Philosophy

> **"Every child should be able to play."**

The game should be usable by children with:
- Motor difficulties
- Visual impairments
- Hearing differences
- Cognitive variations
- Attention challenges

---

## Motor Accessibility

### Touch Alternatives

| Standard Input | Accessible Alternative |
|----------------|----------------------|
| Drag-and-drop | Tap-to-place (default) |
| Swipe | Tap buttons |
| Pinch zoom | Zoom buttons |
| Multi-touch | Single-touch only |

### Target Sizes

| Element | Size | WCAG Target |
|---------|------|-------------|
| Word cards | 80x60px | Exceeds (44x44) |
| Buttons | 64x48px | Exceeds |
| Navigation | 56x56px | Exceeds |

### Timing

- **No time limits** on sentence building
- **No forced timing** on any screen
- **Pause anytime** (tap outside game area)
- **Auto-pause** when app backgrounds

### Touch Forgiveness

- Generous hit areas (extend beyond visual)
- Debounced inputs (no accidental double-taps)
- Undo always available
- Tap-to-deselect after tap-to-select

---

## Visual Accessibility

### Color Independence

Never rely on color alone:

| Information | Color | Redundant Cue |
|-------------|-------|---------------|
| Correct answer | Green | Glow + checkmark + sound |
| Incorrect answer | Red | Shake + sound |
| Progress | Fill | Numerical (2/4) |
| Mastery level | Color | Icon + text label |
| Locked | Gray | Lock icon |

### Contrast Ratios

| Element | Ratio | WCAG Level |
|---------|-------|------------|
| Body text | 7:1+ | AAA |
| Large text | 4.5:1+ | AA |
| UI components | 3:1+ | AA |
| Focus indicators | 3:1+ | AA |

### Text Readability

- **Font**: Atkinson Hyperlegible (designed for low vision)
- **Size**: 20px minimum for body, 28px for words
- **Weight**: Regular + Bold only
- **Spacing**: Generous line-height (1.4+)
- **Case**: Sentence case (no ALL CAPS paragraphs)

### Visual Focus Indicators

```css
/* Example focus ring */
:focus-visible {
  outline: 3px solid #FFD700;
  outline-offset: 2px;
  border-radius: 8px;
}
```

---

## Auditory Accessibility

### Audio Alternatives

| Audio | Visual Alternative |
|-------|-------------------|
| Word pronunciation | Word displayed prominently |
| Correct sound | Green glow animation |
| Incorrect sound | Shake animation |
| Voice instructions | Text + icons |
| Background music | Not essential |

### Captions

- All voice feedback has text equivalent
- Text appears alongside audio
- Optional "captions mode" in settings

### Volume Control

```
┌─────────────────────────────────────────────────────────────┐
│                    AUDIO SETTINGS                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Voice           [████████████░░░░] 80%                    │
│   (word sounds)                                              │
│                                                              │
│   Effects         [████████░░░░░░░░] 50%                    │
│   (taps, chimes)                                             │
│                                                              │
│   Music           [████░░░░░░░░░░░░] 25%                    │
│   (background)                                               │
│                                                              │
│   [🔇 Mute All]                                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Cognitive Accessibility

### Consistent Layout

- Same layout on every game screen
- Same button positions across app
- Predictable navigation patterns
- No surprises or sudden changes

### Clear Information

- One instruction at a time
- Simple language (voice)
- Visual hierarchy guides attention
- No distracting elements

### Error Recovery

| Situation | Recovery |
|-----------|----------|
| Wrong word placed | Tap to undo |
| Gave up on sentence | Reset button |
| Lost in navigation | Home button always visible |
| Confused | Hint button always visible |

### Memory Aids

- Visual progress (dots, bars)
- Previous answer visible briefly
- Ghost hints in scaffolding
- Repeat audio button always available

---

## Motion Sensitivity

### Respect System Preferences

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Reduced Motion Mode

| Standard | Reduced Motion |
|----------|---------------|
| Card animations | Instant placement |
| Celebrations | Static confetti |
| Transitions | Fade only |
| Character dance | Still pose |

### User Toggle

Settings include explicit "Reduce Motion" toggle for browsers that don't support the media query.

---

## Screen Reader Support

### ARIA Labels

```jsx
// Example word card
<button
  aria-label="Word: the"
  aria-describedby="word-position-hint"
  role="button"
>
  the
</button>
```

### Focus Management

- Logical tab order
- Focus trapped in modals
- Focus moved on screen change
- Skip links for navigation

### Live Regions

```jsx
// Announce results
<div role="status" aria-live="polite">
  Correct! Great job!
</div>
```

### Landmark Structure

```html
<header role="banner">...</header>
<nav role="navigation">...</nav>
<main role="main">...</main>
<footer role="contentinfo">...</footer>
```

---

## Switch/Keyboard Access

### Keyboard Navigation

| Key | Action |
|-----|--------|
| Tab | Move between elements |
| Enter/Space | Activate element |
| Escape | Close modal/go back |
| Arrow keys | Move within word bank |

### Focus Visible

All interactive elements show clear focus state.

### Switch Compatibility

- All interactions achievable via single-switch
- Scanning mode compatible
- No multi-key requirements

---

## Testing Checklist

### Before Launch

- [ ] Test with VoiceOver (iOS/macOS)
- [ ] Test with TalkBack (Android)
- [ ] Test with keyboard only
- [ ] Test with reduced motion
- [ ] Test with high contrast
- [ ] Test with 200% zoom
- [ ] Color contrast analyzer pass
- [ ] WAVE accessibility check
- [ ] Manual focus order verification

### With Real Users

- [ ] Test with child with motor difficulties
- [ ] Test with child with visual impairment
- [ ] Test with child with attention challenges
- [ ] Parent feedback on accessibility features

---

## Settings Summary

```
┌─────────────────────────────────────────────────────────────┐
│                 ACCESSIBILITY SETTINGS                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Input                                                      │
│   [✓] Tap-to-place only (no dragging)                       │
│   [ ] Larger touch targets                                   │
│                                                              │
│   Visual                                                     │
│   [ ] High contrast mode                                     │
│   [ ] Reduce motion                                          │
│   [ ] Show captions                                          │
│                                                              │
│   Audio                                                      │
│   [✓] Word audio on                                          │
│   [✓] Feedback sounds on                                     │
│   [ ] Music off                                              │
│                                                              │
│   Timing                                                     │
│   [✓] No time limits (default)                               │
│   [ ] Session reminders                                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

← [UX Design](./README.md)

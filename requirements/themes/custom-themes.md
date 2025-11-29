# Custom Themes (AI-Generated)

← [Back to Themes](./README.md)

---

## Overview

Parents can create entirely new themes using AI assistance. This is the "killer feature" of the Admin Dashboard - unlimited content that matches the child's interests.

---

## Use Cases

### "My Kid Loves..."

| Interest | Generated Theme |
|----------|-----------------|
| Dinosaurs | "Dino Discovery: Prehistoric Words" |
| Unicorns | "Unicorn Academy: Magic Spells" |
| Trains | "Choo Choo Junction: Word Express" |
| Space | "Galaxy Explorers: Star Words" |
| Ocean | "Deep Sea Discovery: Ocean Words" |
| Construction | "Builder's Workshop: Word Construction" |

### Benefits

- **Personalization**: Content matches child's current obsession
- **Engagement**: Familiar topics increase motivation
- **Freshness**: New themes when interests change
- **Unlimited**: Generate as many as desired

---

## Creation Flow

### Step 1: Theme Setup

```
┌─────────────────────────────────────────────────────────────┐
│                   CREATE NEW THEME                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Theme Name: [ Dinosaur Discovery          ]                │
│                                                              │
│  What is your child interested in?                          │
│  [ My kid loves dinosaurs, especially T-Rex and           ] │
│  [ Triceratops. They like the idea of being a              ] │
│  [ paleontologist who discovers fossils.                   ] │
│                                                              │
│  Word Difficulty:                                            │
│  ( ) Pre-Primer (easiest)                                   │
│  (•) Primer (medium)                                        │
│  ( ) First Grade (harder)                                   │
│                                                              │
│  Number of Missions:                                         │
│  [  10  ▼ ] (5-15)                                          │
│                                                              │
│              [  ✨ Generate Theme  ]                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Step 2: AI Generation

**Behind the scenes**:
1. LLM receives prompt with:
   - Child's interest description
   - Target word list (based on difficulty)
   - Requested mission count
2. LLM generates:
   - Theme name and display name
   - Story synopsis
   - Story arc (acts)
   - Mission details (intro, sentences, outro)
   - Suggested color palette
   - Feedback phrases
3. Generation takes 10-30 seconds

**Loading State**:
```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                    ✨ Generating Theme...                   │
│                                                              │
│                    [████████░░░░░░░░]                       │
│                                                              │
│           "Creating your dinosaur adventure..."             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Step 3: Review & Edit

```
┌─────────────────────────────────────────────────────────────┐
│                   THEME PREVIEW                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Name: Dino Discovery                                        │
│  Full Title: Dino Discovery: Prehistoric Words              │
│                                                              │
│  Story:                                                      │
│  "You're a young paleontologist who just discovered a      │
│   hidden valley full of dinosaurs! But the dinosaurs       │
│   can only understand you if you speak in complete         │
│   sentences. Build sentences to befriend each dinosaur!"   │
│                                                              │
│  Palette:                                                    │
│  [███] [███] [███] [███]  [Edit Colors]                    │
│  Green  Brown Orange Cream                                  │
│                                                              │
│  Missions: 10 + 1 Boss                                      │
│  [View Missions ▼]                                          │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Mission 1: Meet the T-Rex                          │    │
│  │ "A huge T-Rex is blocking the path! Make friends   │    │
│  │  by building the right sentence!"                  │    │
│  │                                                     │    │
│  │ Sentences:                                          │    │
│  │ 1. "The dinosaur is big."                          │    │
│  │ 2. "I can see you."                                │    │
│  │ 3. "We are friends."                               │    │
│  │                                                     │    │
│  │ [Edit Mission]                                      │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  [Regenerate]  [Save Theme]  [Cancel]                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Step 4: Assets (Optional)

```
┌─────────────────────────────────────────────────────────────┐
│                   THEME ASSETS                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Background Image:                                           │
│  ┌──────────────┐                                           │
│  │              │  [Upload Image]                           │
│  │   [Empty]    │  or                                       │
│  │              │  [Use AI Placeholder]                     │
│  └──────────────┘                                           │
│                                                              │
│  Character Images:                                           │
│  T-Rex:  [Upload] [AI Placeholder]                          │
│  Triceratops: [Upload] [AI Placeholder]                     │
│  Paleontologist: [Upload] [AI Placeholder]                  │
│                                                              │
│  Note: AI placeholders are simple cartoon representations.  │
│  For best experience, upload your own images!               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## AI Prompt Template

### Theme Generator Prompt

```
You are creating an educational word game theme for a 5-year-old.

CHILD'S INTEREST: {interest}
TARGET WORDS: {wordList}
MISSION COUNT: {missionCount}
WORD LEVEL: {difficulty}

Create a complete theme with:

1. THEME INFO
   - Name (2-3 words)
   - Display name (Name + subtitle)
   - Story synopsis (3-4 sentences explaining the adventure)

2. COLOR PALETTE
   - Primary (main UI color)
   - Secondary (accents)
   - Accent (highlights)
   - Background (page bg)
   Provide hex codes. Choose colors that match the theme.

3. CHARACTERS (3-5)
   For each:
   - Name
   - Role in story
   - Associated vocabulary (5 words from target list)

4. STORY ARC
   Divide into 3 acts with plot progression.

5. MISSIONS ({missionCount} + 1 boss)
   For each mission:
   - Title (3-4 words)
   - Type (play, treasure, minigame, boss)
   - Narrative intro (2 sentences, exciting)
   - Sentences (3-5 for play, 5-7 for boss)
     - Use TARGET WORDS primarily
     - 3-6 words per sentence
     - Grammatically correct
     - Age-appropriate
   - Narrative outro (1 sentence, celebratory)
   - Unlock (avatar, sticker, or minigame if applicable)

6. FEEDBACK PHRASES
   - 5 correct phrases (themed)
   - 5 encouragement phrases (themed)
   - 3 celebration phrases (themed)

Return as structured JSON.
```

### Example Output

```json
{
  "name": "Dino Discovery",
  "displayName": "Dino Discovery: Prehistoric Words",
  "synopsis": "You're a young paleontologist exploring a hidden valley where dinosaurs still roam! The dinosaurs only understand complete sentences. Build sentences to befriend dinosaurs, discover fossils, and become the greatest word-scientist ever!",

  "palette": {
    "primary": "#4CAF50",
    "secondary": "#8D6E63",
    "accent": "#FF9800",
    "background": "#F5F5DC"
  },

  "characters": [
    {
      "name": "Rex",
      "role": "Friendly T-Rex guide",
      "vocabulary": ["big", "run", "see", "friend", "play"]
    },
    {
      "name": "Trina",
      "role": "Wise Triceratops",
      "vocabulary": ["help", "look", "three", "find", "good"]
    },
    {
      "name": "Petra",
      "role": "Pterodactyl messenger",
      "vocabulary": ["fly", "up", "go", "fast", "come"]
    }
  ],

  "missions": [
    {
      "title": "Meet the T-Rex",
      "type": "play",
      "intro": "A huge T-Rex is blocking the path! He looks lonely. Maybe if you build a friendly sentence, he'll be your friend!",
      "sentences": [
        "The dinosaur is big.",
        "I can see you.",
        "We are friends now."
      ],
      "outro": "Rex is your friend! He'll help you on your adventure!",
      "unlock": null
    }
  ],

  "feedbackPhrases": {
    "correct": [
      "Roar-some!",
      "Dino-mite!",
      "You're a fossil finder!",
      "Prehistoric perfection!",
      "T-rrific!"
    ],
    "encourage": [
      "Even dinosaurs make mistakes!",
      "Try again, explorer!",
      "Rex believes in you!",
      "Keep digging!",
      "You're learning like a paleontologist!"
    ],
    "celebrate": [
      "You discovered all the words!",
      "The dinosaurs celebrate you!",
      "Greatest explorer ever!"
    ]
  }
}
```

---

## Editing Generated Content

### Edit Mission Sentences

Parents can:
- Change word order
- Swap words (within difficulty level)
- Add/remove sentences
- Change intro/outro text

### Edit Characters

Parents can:
- Rename characters
- Change vocabulary associations
- Upload custom images
- Remove characters

### Edit Palette

Color picker for each palette slot:
- Real-time preview
- Accessibility check (contrast warning)
- Reset to generated default

---

## Limitations

### What AI Cannot Do

- Generate actual images (only descriptions)
- Create audio (uses TTS on generated text)
- Guarantee educational accuracy (parent review recommended)
- Use specific licensed IP (Paw Patrol, etc.)

### Quality Assurance

After generation, parent should:
1. Read through all sentences for appropriateness
2. Check grammar (AI sometimes makes mistakes)
3. Verify words match child's level
4. Review narrative for child-friendliness

### Regeneration

If unsatisfied:
- **Regenerate All**: New theme from scratch
- **Regenerate Mission**: Redo single mission
- **Regenerate Sentences**: New sentences for mission
- **Manual Edit**: Change anything by hand

---

## Storage

### Database Model

```typescript
type CustomTheme = Theme & {
  isCustom: true;
  createdByProfileId: string;
  generationPrompt: string;      // Original interest input
  generatedAt: Date;
  lastEditedAt: Date;
};
```

### Data Persistence

- Stored in Vercel Postgres
- Associated with parent profile
- Can be exported as JSON
- Can be shared (future feature)

---

## Future Features

### Theme Sharing

- Export theme as JSON file
- Import themes from other parents
- Community theme gallery (if going public)

### AI Improvements

- Image generation (DALL-E/Midjourney integration)
- Voice style generation
- Adaptive difficulty based on child performance

### Templates

- Pre-made templates for common interests
- "Remix" existing themes with variations

---

← [Themes](./README.md)

# AI Content Generators

← [Back to Admin Dashboard](./README.md)

---

## Overview

AI generators allow parents to create unlimited content tailored to their child's interests. Powered by OpenAI/Gemini APIs.

---

## Magic Level Creator

### Purpose

Generate new sentences from a topic idea.

### Interface

```
┌─────────────────────────────────────────────────────────────┐
│  MAGIC LEVEL CREATOR                             [✕ Close]  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  What topic should we use?                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ My kid loves dinosaurs. They especially like T-Rex │   │
│  │ and want to be a paleontologist who discovers      │   │
│  │ fossils.                                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  Target Word Level:                                          │
│  (•) Pre-Primer  ( ) Primer  ( ) First Grade  ( ) Mixed    │
│                                                              │
│  Number of Sentences: [ 5 ▼ ]                               │
│                                                              │
│  Theme: [ General ▼ ] (or select existing theme)            │
│                                                              │
│                    [ ✨ Generate Sentences ]                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Generated Output

```
┌─────────────────────────────────────────────────────────────┐
│  GENERATED SENTENCES                                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ✅ Review and edit before saving:                          │
│                                                              │
│  1. "The dinosaur is big."                                  │
│     Words: the, dinosaur, is, big                           │
│     Distractors: small, cat                                 │
│     [Edit] [Remove]                                          │
│                                                              │
│  2. "I can find the fossil."                                │
│     Words: I, can, find, the, fossil                        │
│     Distractors: make, go                                   │
│     [Edit] [Remove]                                          │
│                                                              │
│  3. "The T-Rex can run fast."                               │
│     Words: the, T-Rex, can, run, fast                       │
│     Distractors: walk, slow                                 │
│     [Edit] [Remove]                                          │
│                                                              │
│  ⚠️ New words needed: dinosaur, fossil, T-Rex, fast         │
│  [Add these words with AI audio]                            │
│                                                              │
│  [Regenerate All]  [Save to Theme]  [Create as Mission]    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Story Generator

### Purpose

Generate a complete campaign with storyline, missions, and sentences.

### Interface

```
┌─────────────────────────────────────────────────────────────┐
│  STORY GENERATOR                                 [✕ Close]  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Create a complete adventure!                               │
│                                                              │
│  Theme Name: [ Dinosaur Discovery     ]                     │
│                                                              │
│  What's the story about?                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ A young paleontologist discovers a hidden valley    │   │
│  │ where dinosaurs still live. They need to learn      │   │
│  │ dinosaur language (sentences) to make friends with  │   │
│  │ each dinosaur species.                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  Word Level: [ Pre-Primer ▼ ]                               │
│                                                              │
│  Number of Missions: [ 10 ▼ ]                               │
│                                                              │
│  Include characters? [✓] Yes                                │
│  Character names: [ Rex, Trina, Petra ]                     │
│                                                              │
│                  [ ✨ Generate Full Campaign ]               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Generation Process

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│               ✨ Generating Your Adventure...               │
│                                                              │
│               [████████████░░░░░░░░░]  60%                  │
│                                                              │
│               Creating story arc...                         │
│               Generating mission 6 of 10...                 │
│               Building sentences...                         │
│                                                              │
│               This may take 30-60 seconds.                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Review Output

Full campaign preview with:
- Story synopsis
- Color palette
- Character list
- All missions with sentences
- Edit any element before saving

---

## Custom Theme Wizard

### Step-by-Step Creation

**Step 1: Basic Info**
- Theme name
- Child's interests
- Preferred colors

**Step 2: AI Generation**
- Generate story, characters, missions
- Review and edit

**Step 3: Assets**
- Upload or generate placeholder images
- Generate audio for new words

**Step 4: Review & Save**
- Preview theme appearance
- Test a sample mission
- Save and activate

---

## AI Prompt Templates

### Sentence Generator Prompt

```
You are creating educational sentences for a 5-year-old.

TOPIC: {userTopic}
TARGET WORDS: {wordList}
SENTENCE COUNT: {count}
DIFFICULTY: {level}

Generate {count} simple sentences that:
1. Use primarily words from TARGET WORDS
2. Are 3-6 words long
3. Are grammatically correct
4. Relate to TOPIC
5. Are age-appropriate

For each sentence, provide:
- The sentence text
- Ordered word list
- 2 distractor words

Return as JSON array.
```

### Story Generator Prompt

```
You are creating an educational game campaign for a 5-year-old.

THEME: {themeName}
STORY IDEA: {storyIdea}
WORD LEVEL: {difficulty}
MISSION COUNT: {count}
CHARACTERS: {characters}

Create a complete story arc with:
1. Exciting hook/problem
2. Progressive missions
3. Satisfying conclusion

For each mission:
- Title (3-4 words)
- Type (play/treasure/boss)
- Intro narrative (2 sentences)
- 3-5 sentences using target words
- Outro narrative (1 sentence)

Return as structured JSON.
```

---

## Error Handling

### If AI Fails

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│              ⚠️ Generation Failed                           │
│                                                              │
│  We couldn't generate content right now.                    │
│  This might be due to:                                      │
│  • Internet connection issues                               │
│  • AI service temporarily unavailable                       │
│                                                              │
│  [Try Again]  [Create Manually]                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Rate Limits

- Show warning when approaching limits
- Queue multiple requests
- Cache recent generations

---

← [Admin Dashboard](./README.md) | [Progress Reports →](./progress-reports.md)

# AI Prompt Templates

← [Back to Index](../README.md)

---

## Sentence Validator

```
You are validating a sentence built by a 5-year-old learning to read.

EXPECTED CONTEXT: {missionContext}
AVAILABLE WORDS: {availableWords}
CHILD'S SUBMISSION: "{submittedSentence}"

Evaluate if the child's sentence is:
1. Grammatically correct (proper English sentence structure)
2. Semantically meaningful (makes logical sense)
3. Uses only the available words provided

IMPORTANT: Be flexible with word order when grammatically valid.
- "The cat and dog run" = VALID
- "The dog and cat run" = VALID
- "Cat the dog and run" = INVALID (not grammatical)

Respond with JSON:
{
  "valid": true/false,
  "reason": "Brief explanation if invalid",
  "encouragement": "A short encouraging message for the child"
}

Examples of encouragement:
- Valid: "Perfect sentence!", "You're a great reader!", "That's exactly right!"
- Invalid: "Almost! Try moving one word.", "So close! Check the order."
```

---

## Sentence Generator

```
You are creating educational content for a 5-year-old learning sight words.

THEME: {themeName}
TARGET WORDS: {wordList}
TOPIC: {userTopic}
SENTENCE COUNT: {count}

Generate {count} simple sentences that:
1. Use primarily words from the TARGET WORDS list
2. Are 3-6 words long
3. Are grammatically correct
4. Relate to the TOPIC
5. Would make sense in a {themeName} story

For each sentence, also provide:
- 2-3 distractor words (similar difficulty, not in sentence)
- A brief narrative hook

Return as JSON array:
[
  {
    "text": "The dinosaur is big.",
    "words": ["The", "dinosaur", "is", "big", "."],
    "distractors": ["small", "cat"],
    "narrativeHook": "Look at this huge dinosaur!"
  }
]
```

---

## Campaign Generator

```
You are creating a themed educational campaign for a 5-year-old.

THEME: {themeName}
CHILD'S INTEREST: {interest}
WORD LEVEL: {difficulty}
MISSION COUNT: {missionCount}

Create a story arc with:
1. An exciting problem to solve
2. {missionCount} missions that progress the story
3. A satisfying conclusion

For each mission, provide:
- Title (3-4 words)
- Type (play, treasure, boss)
- Narrative intro (2 sentences, exciting)
- 3-5 sentences using target words
- Narrative outro (1 sentence, celebratory)
- Suggested distractors

Also provide:
- Story synopsis (3-4 sentences)
- Suggested color palette (hex codes)
- 3-5 character names with roles
- 5 correct feedback phrases (themed)
- 5 encouragement phrases (themed)

Return as JSON:
{
  "synopsis": "...",
  "palette": { "primary": "#...", ... },
  "characters": [...],
  "missions": [...],
  "feedbackPhrases": { "correct": [...], "encourage": [...] }
}
```

---

## Custom Theme Wizard

```
You are helping a parent create a custom educational game theme.

CHILD'S INTEREST: {interest}
(Example: "dinosaurs, especially T-Rex")

Generate a complete theme including:

1. THEME NAME
   - Short name (1-2 words)
   - Display name with subtitle

2. STORY SYNOPSIS
   - 3-4 sentences explaining the adventure
   - Age-appropriate, exciting

3. COLOR PALETTE
   - primary, secondary, accent, background
   - Hex codes that match the theme

4. CHARACTERS (3-5)
   - Name
   - Role in story
   - 5 associated vocabulary words

5. FEEDBACK PHRASES
   - 5 "correct" phrases (themed)
   - 5 "encouragement" phrases (themed)
   - 3 "celebration" phrases (themed)

Return as structured JSON.
```

---

## Struggling Word Helper

```
A 5-year-old is having trouble with certain sight words.

STRUGGLING WORDS: {wordList}
CURRENT MASTERY: {masteryData}
CHILD'S THEMES: {preferredThemes}

Generate a special "practice mission" that:
1. Focuses on the struggling words
2. Uses the child's preferred theme style
3. Has heavy scaffolding (ghost hints)
4. Includes extra encouragement

Provide:
- Mission title (encouraging, not shaming)
- Narrative intro (motivating)
- 5 simple sentences using struggling words
- Extra-positive feedback phrases

Keep it fun, not remedial. The child should feel like they're doing something special, not being punished.
```

---

← [Back to Index](../README.md) | [Open Items →](./open-items.md)

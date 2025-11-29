# Paw Patrol: Adventure Bay Rescue

← [Back to Themes](./README.md)

---

## Overview

**Full Title**: Paw Patrol: Adventure Bay Rescue
**Target Age**: 4-6 years
**Difficulty**: Entry-level
**Campaign Length**: 12 missions + 1 boss

---

## Story Synopsis

> Mayor Humdinger has scrambled all the words in Adventure Bay!
> The bridges are broken, the signs are mixed up, and Farmer Yumi's animals are lost.
> Join the Paw Patrol to build sentences and save the day!

### Story Arc

| Act | Missions | Plot |
|-----|----------|------|
| **Act 1** | 1-4 | Words are scrambled, basic rescues |
| **Act 2** | 5-8 | Humdinger's tricks get harder |
| **Act 3** | 9-12 | Final push to Mayor's office |
| **Boss** | 13 | Confront Humdinger, fix the Lookout |

---

## Characters

### Playable Characters (Appear in Missions)

| Character | Role | Vocabulary |
|-----------|------|------------|
| **Chase** | Police pup | help, stop, go, run, find |
| **Marshall** | Fire pup | help, fire, water, run, fast |
| **Skye** | Aviation pup | fly, up, high, go, see |
| **Rubble** | Construction pup | dig, big, make, can, run |
| **Rocky** | Recycling pup | fix, make, can, help, good |
| **Zuma** | Water rescue pup | swim, water, go, help, save |

### Supporting Characters

| Character | Appearances |
|-----------|-------------|
| **Ryder** | Mission intros, celebrations |
| **Mayor Goodway** | Story moments, rewards |
| **Mayor Humdinger** | Antagonist, boss mission |
| **Chickaletta** | Comic relief, treasure nodes |

---

## Visual Design

### Color Palette

```css
:root {
  --paw-primary: #0066CC;        /* Paw Patrol blue */
  --paw-secondary: #FF6B35;      /* Orange accent */
  --paw-accent: #FFD700;         /* Gold highlights */
  --paw-background: #87CEEB;     /* Sky blue */
  --paw-card-bg: #FFFFFF;        /* White cards */
  --paw-text: #1A1A2E;           /* Dark text */
  --paw-success: #4CAF50;        /* Green correct */
  --paw-special: #FFD700;        /* Character card gold */
}
```

### Typography

- **Headings**: Nunito Bold (rounded, friendly)
- **Body**: Nunito Regular
- **Word Cards**: 32px, bold

### Backgrounds

| Screen | Background |
|--------|------------|
| Story Map | Adventure Bay aerial view |
| Game Screen | Location-specific (bridge, farm, etc.) |
| Menu | Lookout tower |
| Celebration | Adventure Bay with fireworks |

---

## Audio

### Voice Phrases (TTS Generated)

**Correct**:
- "Paw-some!"
- "Great job, pup!"
- "You're on the case!"
- "No job too big, no pup too small!"
- "Ryder's gonna love this!"

**Encouragement**:
- "Almost there, pup!"
- "Try again, you've got this!"
- "So close!"
- "Keep going, brave pup!"

**Celebration**:
- "Mission complete!"
- "Adventure Bay is saved!"
- "You're a real Paw Patrol hero!"
- "Whenever you're in trouble, just yelp for help!"

### Music

- **Story Map**: Instrumental Paw Patrol theme (upbeat, adventure)
- **Gameplay**: Light adventure music (60 BPM)
- **Celebration**: Fanfare variation
- **Boss**: More dramatic version

### SFX

- **Card Place**: Pup bark (soft)
- **Correct**: Ryder's whistle chime
- **Complete**: Paw Patrol badge sound

---

## Missions

### Mission 1: Chase to the Rescue

**Unlock**: Default (first mission)
**Scaffolding**: Level 1 (ghost words)

**Narrative Intro**:
> "Uh oh! A kitten is stuck in a tree! Chase needs YOUR help to save it!"

**Sentences**:
1. "Chase can help."
2. "The cat is up."
3. "Chase said go!"

**Narrative Outro**:
> "You did it! The kitten is safe! Chase says THANK YOU!"

**Unlock**: None (first mission)

---

### Mission 2: Marshall's Fire Drill

**Unlock**: Complete Mission 1
**Scaffolding**: Level 1

**Narrative Intro**:
> "Marshall is practicing for a fire drill! Help him get the words in order!"

**Sentences**:
1. "Marshall can run."
2. "Run to help."
3. "The pup is fast."

**Narrative Outro**:
> "Woohoo! Marshall passed the drill! Great teamwork!"

**Unlock**: None

---

### Mission 3: Skye's Sky High

**Unlock**: Complete Mission 2
**Scaffolding**: Level 1

**Narrative Intro**:
> "Skye needs to fly up high to see Adventure Bay! Help her take off!"

**Sentences**:
1. "Skye can fly."
2. "Go up high."
3. "I see the pup."

**Narrative Outro**:
> "This pup's gotta fly! Great reading!"

**Unlock**: Treasure (Star sticker)

---

### Mission 4: Rubble on the Double

**Unlock**: Complete Mission 3
**Scaffolding**: Level 2 (color hints)

**Narrative Intro**:
> "Rubble needs to dig a new path! The words will help him build it!"

**Sentences**:
1. "Rubble can dig."
2. "Make a big one."
3. "The dog can help."
4. "We go down."

**Narrative Outro**:
> "Rubble on the double! You built an amazing path!"

**Unlock**: None

---

### Mission 5: Rocky Recycles

**Unlock**: Complete Mission 4
**Scaffolding**: Level 2

**Narrative Intro**:
> "Rocky found mixed-up recycling! Sort the words to help him clean up!"

**Sentences**:
1. "Rocky can fix it."
2. "Make it good."
3. "The pup said yes."
4. "We can help."

**Narrative Outro**:
> "Don't lose it, reuse it! Great job recycling those words!"

**Unlock**: Word Bingo mini-game

---

### Mission 6: Zuma's Water Rescue

**Unlock**: Complete Mission 5
**Scaffolding**: Level 2

**Narrative Intro**:
> "Someone's stuck in the water! Zuma needs your word power to save them!"

**Sentences**:
1. "Zuma can swim."
2. "Go in the water."
3. "Help is here."
4. "We save the day."

**Narrative Outro**:
> "Let's dive in! You're a true water rescue hero!"

**Unlock**: Treasure (Zuma sticker)

---

### Mission 7: Bridge Builder

**Unlock**: Complete Mission 6
**Scaffolding**: Level 2

**Narrative Intro**:
> "The bridge to Farmer Yumi's is broken! Build sentences to fix it piece by piece!"

**Visual Progress**: Bridge builds with each correct sentence

**Sentences**:
1. "We can make it."
2. "The bridge is down."
3. "Go and help."
4. "Run to see."

**Narrative Outro**:
> "The bridge is fixed! Farmer Yumi can get home now!"

**Unlock**: None

---

### Mission 8: Farmer Yumi's Animals

**Unlock**: Complete Mission 7
**Scaffolding**: Level 2

**Narrative Intro**:
> "Farmer Yumi's animals ran away! Use words to bring them back!"

**Sentences**:
1. "The cat ran away."
2. "Find the big dog."
3. "Come here, little one."
4. "I see two cats."

**Narrative Outro**:
> "All the animals are back! Farmer Yumi is so happy!"

**Unlock**: Treasure (Farmer Yumi sticker)

---

### Mission 9: Mayor's Missing Chickens

**Unlock**: Complete Mission 8
**Scaffolding**: Level 3 (first word only)

**Narrative Intro**:
> "Chickaletta and her friends are missing! Mayor Goodway needs help!"

**Sentences**:
1. "Where is the chicken?"
2. "Look under the tree."
3. "I can find them."
4. "They went this way."
5. "Run and look."

**Narrative Outro**:
> "Purr purr purr-urr! Chickaletta is back with Mayor Goodway!"

**Unlock**: Memory Match mini-game

---

### Mission 10: Humdinger's Mess

**Unlock**: Complete Mission 9
**Scaffolding**: Level 3

**Narrative Intro**:
> "Mayor Humdinger made a big mess! Clean up the words to save the town!"

**Sentences**:
1. "What a big mess."
2. "We must clean up."
3. "Help me, please."
4. "Go get the mop."
5. "It is all clean now."

**Narrative Outro**:
> "The mess is cleaned up! But where is Humdinger?"

**Unlock**: Treasure (Humdinger sticker)

---

### Mission 11: The Lookout Alert

**Unlock**: Complete Mission 10
**Scaffolding**: Level 3

**Narrative Intro**:
> "The Lookout is sending alerts! Decode the messages to help the pups!"

**Sentences**:
1. "Pups, we have a mission."
2. "Ryder said to go now."
3. "All pups come here."
4. "Look at the big tower."
5. "We are the Paw Patrol."

**Narrative Outro**:
> "All pups are ready! Time to face Humdinger!"

**Unlock**: None

---

### Mission 12: Road to the Tower

**Unlock**: Complete Mission 11
**Scaffolding**: Level 3

**Narrative Intro**:
> "The path to Humdinger's tower is blocked with scrambled words! Clear the way!"

**Sentences**:
1. "We run up the hill."
2. "The tower is here."
3. "Can we go in?"
4. "Yes, we can!"
5. "Let us save the day."

**Narrative Outro**:
> "The path is clear! Time for the final mission!"

**Unlock**: Treasure (Ryder sticker)

---

### Boss Mission: Save the Lookout

**Unlock**: Complete Mission 12
**Scaffolding**: Level 4 (none)

**Narrative Intro**:
> "Mayor Humdinger scrambled all the words in the Lookout! If we don't fix them, the Paw Patrol can't do their job! This is the big one, pup. Are you ready?"

**Sentences**:
1. "The Lookout is in trouble."
2. "Humdinger made a mess."
3. "All pups work together."
4. "We can fix everything."
5. "Chase is on the case."
6. "Marshall, fire it up!"
7. "Adventure Bay is saved!"

**Narrative Outro**:
> "YOU DID IT! The Lookout is fixed, Humdinger ran away, and Adventure Bay is safe! You're an official member of the Paw Patrol now!"

**Unlocks**:
- Paw Patrol Champion sticker
- Crown avatar
- Next campaign (Bluey)

---

## Character Cards

When character names appear as words:

```
┌─────────────────┐
│  [Chase image]  │   ← Character portrait
│                 │
│     Chase       │   ← Name below
│                 │
│ ✨ Gold border  │   ← Special styling
└─────────────────┘
```

---

## Stickers Available

| Sticker | Unlock |
|---------|--------|
| Chase badge | Mission 1 |
| Star | Mission 3 (Treasure) |
| Zuma | Mission 6 (Treasure) |
| Farmer Yumi | Mission 8 (Treasure) |
| Humdinger | Mission 10 (Treasure) |
| Ryder | Mission 12 (Treasure) |
| Paw Patrol Champion | Boss Complete |

---

← [Themes](./README.md) | [Bluey →](./bluey.md)

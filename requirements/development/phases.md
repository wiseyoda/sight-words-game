# Development Phases (Detailed)

← [Back to Development](./README.md)

---

## Phase 1: The Engine

### Objective

Build the core sentence-building mechanic with AI validation.

### Tasks

#### Project Setup

- [ ] Initialize Next.js 14 with App Router
- [ ] Configure TypeScript strict mode
- [ ] Set up Tailwind CSS
- [ ] Deploy to Vercel
- [ ] Configure environment variables

#### Database

- [ ] Set up Vercel Postgres
- [ ] Install and configure Drizzle ORM
- [ ] Create schema: words, sentences, players
- [ ] Seed with Pre-Primer word list
- [ ] Create 10 test sentences

#### Sentence Builder

- [ ] Create WordCard component
- [ ] Create Slot component
- [ ] Implement tap-to-place interaction
- [ ] Implement drag-and-drop (dnd-kit)
- [ ] Word bank rendering
- [ ] Slot state management (Zustand)

#### AI Validation

- [ ] Set up Vercel AI SDK
- [ ] Create validation prompt
- [ ] Implement `/api/ai/validate-sentence`
- [ ] Handle success/failure responses
- [ ] Add loading state

#### Audio (TTS)

- [ ] Set up OpenAI TTS
- [ ] Create `/api/audio/[wordId]` route
- [ ] Implement Vercel Blob storage
- [ ] Create audio manager (Howler.js)
- [ ] Word playback on tap

#### Basic Admin

- [ ] Simple word addition form
- [ ] Sentence addition form
- [ ] View all words/sentences

### Deliverables

- Playable sentence builder
- AI validation working
- Words speak when tapped
- Basic CRUD for content

---

## Phase 2: The "Juice"

### Objective

Make the game feel polished and engaging.

### Tasks

#### Animations

- [ ] Card tap animation
- [ ] Card placement animation
- [ ] Card return animation
- [ ] Correct sentence glow
- [ ] Incorrect sentence shake
- [ ] Celebration confetti

#### Story Map

- [ ] Map component
- [ ] Node rendering
- [ ] Path connections
- [ ] Current position indicator
- [ ] Locked/unlocked states
- [ ] Navigation between nodes

#### Mission Flow

- [ ] Mission intro screen
- [ ] Narrative text display
- [ ] Character display
- [ ] Transition animations
- [ ] Mission complete screen
- [ ] Star reveal animation

#### Hints

- [ ] Hint button
- [ ] Level 1: First word highlight
- [ ] Level 2: Ghost words
- [ ] Level 3: Audio playback
- [ ] Hint cooldown
- [ ] Star impact

#### Feedback

- [ ] Correct sound effect
- [ ] Incorrect sound effect
- [ ] Voice phrases (TTS)
- [ ] Progress indicator
- [ ] Star calculation

### Deliverables

- Complete mission flow
- Animated, satisfying interactions
- Story map navigation
- Working hint system

---

## Phase 3: AI & Admin

### Objective

Enable parents to manage content and track progress.

### Tasks

#### Dashboard Shell

- [ ] Admin layout
- [ ] Navigation menu
- [ ] Parental gate (math problem)
- [ ] Session management

#### Player Management

- [ ] Create player profile
- [ ] Edit player
- [ ] Switch players
- [ ] Delete player
- [ ] Player settings

#### Progress Reports

- [ ] Word mastery visualization
- [ ] Time played stats
- [ ] Mission history
- [ ] Struggling word alerts
- [ ] Export to CSV

#### AI Generators

- [ ] Sentence generator UI
- [ ] Sentence generator API
- [ ] Campaign generator UI
- [ ] Campaign generator API
- [ ] Preview and edit
- [ ] Save to database

#### Library Management

- [ ] Word bank CRUD
- [ ] Sentence bank CRUD
- [ ] Audio regeneration
- [ ] Theme management

### Deliverables

- Full admin dashboard
- AI content generation
- Progress tracking

---

## Phase 4: Themes & Polish

### Objective

Ship-ready with three polished themes.

### Tasks

#### Theme Engine

- [ ] CSS variable system
- [ ] Theme context/provider
- [ ] Dynamic asset loading
- [ ] Theme switching

#### Paw Patrol Theme

- [ ] Color palette
- [ ] Background assets
- [ ] Character images
- [ ] All 13 missions
- [ ] Feedback phrases
- [ ] Audio generation

#### Bluey Theme

- [ ] Color palette
- [ ] Background assets
- [ ] Character images
- [ ] All 13 missions
- [ ] Feedback phrases
- [ ] Audio generation

#### Marvel Theme

- [ ] Color palette
- [ ] Background assets
- [ ] Character images
- [ ] All 16 missions
- [ ] Feedback phrases
- [ ] Audio generation

#### Audio Polish

- [ ] SFX pack creation
- [ ] Background music
- [ ] Volume balancing
- [ ] Audio sprite optimization

#### Testing

- [ ] Performance testing
- [ ] User testing with kids
- [ ] Bug fixes
- [ ] Polish pass

### Deliverables

- Three complete themes
- Professional audio
- Tested and polished

---

## Phase 5: Beyond

### Objective

Expand with mini-games and additional content.

### Tasks

#### Mini-Games

- [ ] Word Bingo implementation
- [ ] Memory Match implementation
- [ ] Whack-a-Word implementation
- [ ] Unlock conditions
- [ ] Integration with map

#### Additional Content

- [ ] Sticker collection UI
- [ ] More themes (Frozen, Mario, etc.)
- [ ] Custom theme wizard
- [ ] Additional word levels

#### Future Features

- [ ] Voice recognition for reading
- [ ] Multiplayer/sibling mode
- [ ] Print worksheets
- [ ] More mini-games

### Deliverables

- Three mini-games
- Expanded content library
- Foundation for future growth

---

← [Development](./README.md)

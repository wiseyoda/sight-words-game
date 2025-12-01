# Project Overview

← [Back to Index](./README.md)

---

## Purpose

An engaging, premium-quality web application designed to help kindergarten-aged children (approximately 5 years old) learn **sight words** through narrative-driven gameplay.

### What are Sight Words?

Sight words (also called high-frequency words) are common words that children are encouraged to memorize by sight rather than sounding out. The **Dolch Word List** is the foundation:

- **Pre-Primer**: 40 words (basic vocabulary)
- **Primer**: 52 words (expanded vocabulary)
- **First Grade**: 41 words (reading readiness)

Mastering these 133 words accounts for approximately **50-75% of all words** in children's books.

### Why This Matters

- Traditional flashcard drilling is boring for 5-year-olds
- Narrative context makes words memorable
- Game mechanics provide intrinsic motivation
- Immediate feedback accelerates learning
- Play sessions are short and satisfying

---

## Target Audience

### Primary Users: Children

| Attribute | Specification |
|-----------|---------------|
| **Age Range** | 4-6 years old |
| **Reading Level** | Pre-reader to early reader |
| **Tech Comfort** | Can tap/swipe on tablet |
| **Attention Span** | 10-15 minute sessions |
| **Motivation** | Stories, characters, rewards |

**Child Personas**:

1. **Emma (5)** - Loves Paw Patrol, knows some letters, excited about "reading like a big kid"
2. **Lucas (4.5)** - Into superheroes, short attention span, needs lots of positive reinforcement
3. **Sofia (6)** - Already reading simple books, wants a challenge, competitive with siblings

### Secondary Users: Parents/Guardians

| Attribute | Specification |
|-----------|---------------|
| **Role** | Content manager, progress monitor |
| **Tech Comfort** | Moderate (can navigate dashboards) |
| **Time Available** | 5-10 min for setup/monitoring |
| **Goals** | Track progress, customize content |

**Parent Personas**:

1. **Sarah** - Busy professional, wants to set-and-forget but see weekly progress
2. **Mike** - Stay-at-home dad, actively involved, wants to customize content
3. **Grandma Pat** - Less tech-savvy, just needs to start the game for grandkids

---

## Target Platforms

### Primary: Tablets

| Device | Screen Size | Orientation |
|--------|-------------|-------------|
| iPad (any size) | 9.7" - 12.9" | **Landscape only** |
| iPad Mini | 7.9" | Landscape only |
| Android Tablets | 8" - 11" | Landscape only |
| Fire HD | 8" - 10" | Landscape only |

**Minimum Resolution**: 1024 x 768 (iPad Mini landscape)

### Secondary: Desktop Browsers

| Browser | Version |
|---------|---------|
| Chrome | 90+ |
| Safari | 14+ |
| Firefox | 88+ |
| Edge | 90+ |

**Desktop Target**: 1280 x 720 minimum window size

### Not Supported

- **Phones** - Screen too small for word cards
- **Portrait orientation** - Sentence builder needs horizontal space
- **IE/Legacy browsers** - No modern CSS/JS support

---

## Deployment

| Aspect | Choice |
|--------|--------|
| **Hosting** | Vercel |
| **Framework** | Next.js 16+ |
| **Database** | Vercel Postgres |
| **CDN** | Vercel Edge Network |
| **Domain** | TBD (private use initially) |

---

## Core Philosophy

### 1. "Premium Fun"

The app should feel like a **real game**, not educational software. This means:

- **Animations**: Smooth, satisfying, purposeful (not gratuitous)
- **Sound Design**: Professional SFX, ambient music, voice acting
- **Visual Polish**: Consistent art style, attention to detail
- **"Juice"**: Screen shake on success, particle effects, haptic feedback

**Reference Games**: Duolingo (gamification), Candy Crush (map UI), Monument Valley (polish)

### 2. "Narrative First"

Every action has story context:

- Words aren't just "exercises" - they're **tools to solve problems**
- Completing missions **advances the plot**
- Characters **react** to the child's actions
- The world **changes** based on progress

**Example**:
> "Oh no! The bridge is broken and Chase can't get across! If you build the right sentence, we can fix it!"

### 3. "Infinite Content"

AI-powered content generation ensures:

- **No content ceiling**: Parent can generate unlimited missions
- **Personalization**: Content adapts to child's interests
- **Fresh challenges**: Never the exact same experience twice
- **Parent creativity**: "What if we made a dinosaur theme?"

### 4. "Encouragement over Punishment"

**Never**:
- "Game Over" screens
- Lives/hearts that run out
- Time pressure
- Comparing to other children
- Negative sounds (buzzers, failure stings)

**Always**:
- "Try Again!" with a smile
- Unlimited attempts
- Hints available
- Celebration of effort
- Stars that accumulate (never decrease)

### 5. "Private & Familiar"

- **Licensed Characters**: Paw Patrol, Bluey, Marvel, etc.
- **Legal Context**: Private family use only, not distributed
- **Familiarity Advantage**: Kids already love these characters
- **Future-Proofing**: Can create original characters if going public

### 6. "Cloud-Powered"

- **Requires Internet**: No offline mode
- **LLM Integration**: Sentence validation, content generation
- **TTS On-Demand**: Audio generated and cached
- **Progress Sync**: Data stored in cloud database
- **Trade-off Accepted**: Simplifies architecture, accepts dependency

---

## Success Metrics

### For Children

| Metric | Target |
|--------|--------|
| Session completion | > 80% finish a mission once started |
| Return rate | Play at least 3 days/week |
| Word mastery velocity | 5-10 new words/week |
| Star accumulation | Average 2.2 stars/mission |
| Frustration events | < 1 "give up" per 5 missions |

### For Parents

| Metric | Target |
|--------|--------|
| Onboarding completion | > 90% complete tutorial |
| Dashboard visits | At least 1x/week |
| AI generator usage | 30% of parents try it |
| Content customization | 20% add custom words |
| NPS (if surveyed) | > 50 |

### Technical

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 2s |
| API response time | < 500ms |
| Error rate | < 0.1% of sessions |
| Audio load time | < 300ms (cached) |

---

## Constraints

### Technical Constraints

- **No Native App**: Web-only (no App Store deployment)
- **No Offline**: Requires internet for AI features
- **No WebRTC**: No real-time multiplayer
- **No User Accounts**: Simple profile system, no passwords for kids

### Legal Constraints

- **IP Usage**: Licensed characters for private use only
- **COPPA**: No personal data collection beyond local storage
- **Privacy**: No analytics, no tracking, no third-party data

### Design Constraints

- **Landscape Only**: Force orientation on mobile
- **No Typing**: Kids can't type; all input via tap/drag
- **No Reading Required**: Navigation must work without reading
- **Large Touch Targets**: 64px minimum, 80px preferred

### Resource Constraints

- **Solo Developer**: One parent building this
- **Limited Testing**: One family (2-3 kids)
- **Time Budget**: Weekends and evenings
- **Cost Conscious**: Vercel free/hobby tier preferred

---

## Related Documents

- [Gameplay Mechanics](./gameplay/) - How the game works
- [Technical Architecture](./technical/) - How it's built
- [Development Roadmap](./development/) - When it's built

---

← [Back to Index](./README.md)

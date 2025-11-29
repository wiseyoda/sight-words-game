# Phase 3: AI & Admin

← [Phase 2: Juice](./phase-2-juice.md) | [Back to Development](./README.md)

---

## Status: ⏳ Planned

**Last Updated**: 2025-11-29

Phase 3 enables parents to manage content, track progress, and use AI to generate custom learning material.

---

## Objective

Enable parents to manage content and track progress through an admin dashboard with AI-powered content generation.

---

## Progress Summary

| Category | Status | Completion |
|----------|--------|------------|
| Dashboard Shell | ⏳ Planned | 0/4 |
| Player Management | ⏳ Planned | 0/5 |
| Progress Reports | ⏳ Planned | 0/5 |
| AI Generators | ⏳ Planned | 0/6 |
| Library Management | ⏳ Planned | 0/4 |

**Overall**: 0/24 tasks complete (0%)

---

## Task Details

### Dashboard Shell

- [ ] Admin layout component
- [ ] Navigation menu sidebar
- [ ] Parental gate (math problem)
- [ ] Session management

**Parental Gate Example:**
```
To access parent settings, please solve:
7 + 5 = [ ]
```

### Player Management

- [ ] Create player profile (name, avatar)
- [ ] Edit player details
- [ ] Switch between players
- [ ] Delete player (with confirmation)
- [ ] Player-specific settings

### Progress Reports

- [ ] Word mastery visualization (progress bars)
- [ ] Time played statistics
- [ ] Mission completion history
- [ ] Struggling word alerts
- [ ] Export data to CSV

**Key Metrics:**
- Words mastered / total
- Average attempts per word
- Time played (daily/weekly/all-time)
- Mission star ratings

### AI Generators

- [ ] Sentence generator UI (topic input)
- [ ] Sentence generator API (`/api/ai/generate-sentences`)
- [ ] Campaign generator UI (theme + topic)
- [ ] Campaign generator API (`/api/ai/generate-campaign`)
- [ ] Preview generated content before saving
- [ ] Save to database with audio generation

**"Magic Level Creator" Flow:**
```
Parent enters topic → AI generates sentences → Preview → Edit → Save
```

### AI Model Configuration

- [ ] Model selection per task type (admin settings page)
- [ ] Store model preferences in database
- [ ] Default model fallbacks if selected model unavailable
- [ ] Display model info in admin (current model, cost estimate)

**Configurable Models (as of Nov 2025):**

| Task | Default Model | Alternatives |
|------|---------------|--------------|
| Sentence Validation | `gpt-4o-mini` | `gpt-5.1` (with `reasoning_effort: none`) |
| Sentence Generation | `gpt-4o` | `gpt-5.1`, `gpt-5` |
| Campaign Generation | `gpt-4o` | `gpt-5.1`, `gpt-5` |
| Theme Wizard | `gpt-4o` | `gpt-5.1`, `gpt-5` |

> **Future-Proofing Note**: OpenAI released GPT-5 and GPT-5.1 in 2025 with significant improvements in coding, agentic tasks, and instruction following. GPT-5.1 supports adaptive reasoning (`reasoning_effort` parameter) that can be set to `none` for latency-sensitive tasks like validation. The admin panel should allow switching models to take advantage of newer capabilities as they become available.
>
> **Reference**: [GPT-5.1 for Developers](https://openai.com/index/gpt-5-1-for-developers/) | [GPT-5 Prompting Guide](../appendices/openai-prompting-tips.md)

### Library Management

- [ ] Word bank CRUD (add/edit/delete words)
- [ ] Sentence bank CRUD
- [ ] Audio regeneration (per word/batch)
- [ ] Theme content management

---

## Deliverables

| Deliverable | Status |
|-------------|--------|
| Full admin dashboard | ⏳ Pending |
| AI content generation | ⏳ Pending |
| Progress tracking | ⏳ Pending |
| Multi-player support | ⏳ Pending |

---

## Exit Criteria

> Parent can create custom content with AI and view child's progress.

**Status**: ⏳ Not Started

---

## Dependencies

- Phase 1 core gameplay (complete)
- Phase 2 mission flow (for progress context)

---

## Related Documentation

- [Admin Dashboard](../admin-dashboard/README.md)
- [AI Generators](../admin-dashboard/ai-generators.md)
- [Progress Reports](../admin-dashboard/progress-reports.md)
- [Content Management](../admin-dashboard/content-management.md)
- [AI Integration](../technical/ai-integration.md)

---

← [Phase 2: Juice](./phase-2-juice.md) | [Phase 4: Themes →](./phase-4-themes.md)

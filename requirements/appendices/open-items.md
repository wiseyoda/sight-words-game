# Open Items & Decisions

← [Back to Index](../README.md)

---

## Resolved Decisions

| Decision | Resolution | Date |
|----------|------------|------|
| Licensed IP usage | Acceptable for private family use | Nov 2025 |
| Launch themes | Paw Patrol, Bluey, Marvel | Nov 2025 |
| Tech stack | Next.js + Postgres + Vercel | Nov 2025 |
| Input method | Tap-to-place primary, drag secondary | Nov 2025 |
| Failure handling | No "game over", encouragement only | Nov 2025 |
| Sentence validation | AI-powered (LLM), not strict matching | Nov 2025 |
| Audio generation | On-demand via OpenAI TTS, cached in Blob | Nov 2025 |
| Offline support | None - cloud-powered, requires internet | Nov 2025 |

---

## Pending Decisions

### To Discuss with User

| Item | Options | Notes |
|------|---------|-------|
| Parent voice recording | Allow parents to record their own voice for words | Could personalize experience |
| Sibling mode | Simple profile switching vs competitive "race" | Could add engagement |
| Print worksheets | Generate PDFs for offline practice | Extra work, unclear value |
| Tablet keyboard | Custom kid keyboard vs native | UX consideration for name entry |

### Technical Decisions

| Item | Options | Notes |
|------|---------|-------|
| Error tracking | Sentry vs Vercel vs none | Cost/complexity tradeoff |
| Analytics | Vercel Analytics vs none | Privacy consideration |
| CI/CD | GitHub Actions vs Vercel auto | Simplicity preference |

---

## Future Considerations

### Phase 5+

- Voice recognition for reading aloud
- Multiplayer/sibling competition
- More advanced word levels (2nd/3rd grade)
- Reading comprehension games
- Progress sharing with teachers

### If Going Public

- Replace licensed IP with original characters
- COPPA compliance review
- Terms of service
- Proper user authentication
- Monetization model (if any)

---

## Known Risks

| Risk | Mitigation |
|------|------------|
| OpenAI API costs escalate | Cache aggressively, monitor usage |
| LLM validation latency | Edge functions, graceful degradation |
| Child loses interest | Regular new content, variety |
| Scope creep | Stick to phases, ship MVP first |

---

## Security & Technical Debt (Nov 2025 Review)

> Items identified during code review. Address before production deployment.

### Critical (Pre-Production)

| Issue | Location | Notes |
|-------|----------|-------|
| Progress API unauthenticated | `/api/progress` | Anyone with player UUID can read/write progress |
| Audio endpoints unauthenticated | `/api/audio/*` | Can incur unbounded OpenAI API costs |
| Admin cookie forgeable | `middleware.ts` | Cookie encoding fixed, but needs signed server-side sessions |

### High Priority

| Issue | Location | Notes |
|-------|----------|-------|
| Progress writes skip validation | `/api/progress` POST | Can mark any mission complete |
| data-models.md outdated | `requirements/technical/` | 47+ discrepancies with actual schema |

### Lower Priority (Post-MVP)

| Issue | Location | Notes |
|-------|----------|-------|
| Audio cache invalidation fragile | `/api/audio/[word]` | ETag version not tracked server-side |
| Parental gate client-only | `ParentalGate.tsx` | Acceptable for young children |
| Hardcoded demo player | `play/page.tsx` | Move to proper player selection |
| Inconsistent ID validation | Various routes | Standardize on Zod schemas |
| Zoom disabled | `layout.tsx`, `globals.css` | WCAG conflict - consider allowing |

---

## Questions to Answer During Development

1. What's the ideal session length before suggesting a break?
2. Should stars affect gameplay difficulty?
3. How many distractors is too many?
4. What's the right balance of new vs review words?
5. Should parents see real-time play or just summaries?

---

← [Back to Index](../README.md)

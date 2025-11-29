# Changelog

All notable changes to this project will be documented in this file.

This changelog focuses on human-readable summaries of significant changes, architectural decisions, and feature additions. For detailed commit history, see Git log.

---

## [Unreleased]

*Development has not yet begun. See [Development Roadmap](./development/README.md) for planned phases.*

---

## 2025-11-29

### Documentation

#### Requirements Documentation Created

Comprehensive project requirements documentation was established, organizing all specifications into a navigable folder structure.

**What was created:**
- Master index at `/requirements/README.md`
- Project overview with personas, platforms, and philosophy
- Gameplay specifications (sentence builder, feedback, mini-games)
- Theme specifications (Paw Patrol, Bluey, Marvel, custom themes)
- Curriculum details (Dolch word lists, mastery tracking, adaptive difficulty)
- Progression system (story map, unlockables)
- UX design guidelines (principles, layouts, accessibility)
- Admin dashboard specs (content management, AI generators, reports)
- Audio system (TTS integration, sound design)
- Technical architecture (data models, API routes, AI integration)
- Development roadmap with 5 phases

**Why:** A single 1000+ line REQUIREMENTS.md was refactored into ~40 navigable files to improve maintainability and allow deeper specification per topic.

#### GitHub README Established

Created a best-in-class public-facing README.md with:
- Project overview and motivation
- Feature lists (for kids and parents)
- Complete tech stack with links
- Getting started guide
- Project structure documentation
- Links to detailed requirements
- Development phase roadmap

#### Claude Code Instructions Updated

Updated CLAUDE.md with workflow instructions:
1. Requirements-first development approach
2. Change protocol with strikethrough for superseded content
3. README maintenance responsibilities
4. Progress tracking in development folder
5. Changelog maintenance guidelines

---

## Format Guide

### Entry Structure

```markdown
## YYYY-MM-DD

### Category

#### Change Title

Brief description of what changed and why.

**What:** Specific details of the change
**Why:** Rationale or motivation
**Impact:** Any effects on other parts of the system
```

### Categories

- **Features** - New functionality
- **Changes** - Modifications to existing functionality
- **Fixes** - Bug fixes
- **Documentation** - Documentation updates
- **Architecture** - Structural or technical decisions
- **Requirements** - Changes to specifications
- **Removed** - Deprecated or removed features

---

← [Back to Index](./README.md)

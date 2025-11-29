# Repository Guidelines

## Project Structure & Module Organization
- This is a new repo; organize early. Use `src/` for gameplay logic and UI, with `src/components/` for reusable views and `src/game/` for state/logic. Place static entry HTML in `public/` and visual/audio assets in `assets/`. Keep tests in `tests/` or next to source as `*.test.ts`/`*.test.tsx`. Add helper scripts (seeding, checks) under `scripts/`.
- Keep domain terms consistent: sight words, rounds, attempts, feedback cues. Update `README.md` when structure shifts.

## Build, Test, and Development Commands
- Standardize on Node + npm. After scaffolding, install deps with `npm install`.
- Run the dev server (Vite/React or similar) with `npm run dev`. Produce production bundles via `npm run build`; verify output locally with `npm run preview`.
- Execute automated tests with `npm test` and lint/format with `npm run lint` (and `npm run format` if added). Document any additional scripts in `package.json` so new contributors can discover them with `npm run`.

## Coding Style & Naming Conventions
- Prefer TypeScript for UI and game logic. Use 2-space indentation, semicolons, and import paths that avoid deep relative chains (introduce path aliases when the tree grows).
- Component files in PascalCase, hooks prefixed with `use`, utility modules in camelCase filenames. Keep functions pure where possible and make side effects explicit (audio playback, timers).
- Run ESLint + Prettier before pushing; keep configs committed so formatting is deterministic.

## Testing Guidelines
- Co-locate specs as `*.test.tsx` or keep them under `tests/`. Use React Testing Library for UI interactions and stub randomness/timers for deterministic runs.
- Cover critical behaviours: showing the correct sight word, input/selection handling, scoring or timing rules, audio/visual feedback toggles, and regression tests for recent bugs.
- Keep tests headless and fast; gate merges on passing tests and lint.

## Commit & Pull Request Guidelines
- Follow Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`) with succinct scopes (e.g., `feat: add streak bonus`).
- PRs should include: a brief summary, screenshots or GIFs for UI changes, a list of manual checks performed, and linked issues when relevant. Keep diffs focused and explain any content impacting child safety or accessibility.

## Accessibility & Safety Notes
- Default to high-contrast palettes, readable type, and large tap targets suitable for kindergarten learners. Provide audio toggles and avoid rapid flashing or distracting loops.
- Do not collect personal data; keep state local unless a privacy-safe backend is introduced. Document any configuration or environment variables in `.env.example` when added.

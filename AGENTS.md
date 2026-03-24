# AGENTS.md

Guidance for coding agents working in this repository.

## Project Snapshot

- Stack: Astro 6, TypeScript strict config, static site output.
- Package manager: npm (`package-lock.json` is committed).
- Runtime: Node.js `>=22.12.0` (enforced in `package.json`).
- Current codebase state: Astro starter scaffold with minimal pages/components.
- Domain intent is documented in `docs/Mapa de Memoria.md`, but most features are not implemented yet.

## Repository Map

- `src/pages/` route entrypoints (`index.astro` currently).
- `src/layouts/` shared page wrappers (`Layout.astro`).
- `src/components/` presentational Astro components (`Welcome.astro`).
- `src/assets/` static assets imported by Astro components.
- `public/` passthrough static files.
- `docs/` product/domain requirements and source material.
- `astro.config.mjs` Astro configuration.
- `tsconfig.json` extends `astro/tsconfigs/strict`.

## Source of Truth for Commands

- Always prefer commands defined in `package.json` scripts.
- If you need additional Astro CLI functionality, use `npm run astro -- <command>`.
- Do not document or run guessed scripts that are not present.

## Setup and Local Development

- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Preview built output locally: `npm run preview`
- Build static output: `npm run build`
- Astro CLI help: `npm run astro -- --help`

## Quality, Lint, and Type Checks

- There is no dedicated ESLint or Prettier setup in this repo.
- There is no `lint` npm script currently.
- Use Astro check for static analysis/type validation:
  - `npm run astro -- check`
- Optional type generation sync command (Astro CLI):
  - `npm run astro -- sync`

## Testing Status (Important)

- There is no test framework configured yet (no `test` script, no test config files).
- Therefore, file-level and test-name-level single-test execution are currently **not supported**.
- If tests are introduced later, update this file with exact commands from repository configs.
- Until then, validate changes with:
  - `npm run astro -- check`
  - targeted manual verification in `npm run dev`

## Single-Test Guidance Policy

- Never invent `npm test` usage in this repository unless a `test` script exists.
- Never claim support for `--grep`, `-t`, or file-path test filtering without verified tooling.
- When adding a new test runner, document:
  - full-suite command,
  - single file command,
  - single test-name command,
  - watch mode command (if available).

## Coding Conventions in This Repo

## 1) Astro component conventions

- Use `.astro` files for pages/layouts/components.
- Keep frontmatter imports at the top between `---` markers.
- Keep markup declarative; push heavy logic to scripts/util modules when complexity grows.
- Prefer semantic HTML and accessible attributes (`alt`, landmarks, heading order).

## 2) Import conventions

- Use explicit relative imports (`../`, `./`) matching existing code.
- Group imports at top of frontmatter.
- Keep import paths stable and predictable; avoid deep cross-folder traversal when a shared module can be introduced.
- Remove unused imports immediately.

## 3) Formatting conventions

- Follow existing file style instead of forcing a new formatter.
- Existing `.astro` files use tabs for indentation; preserve this in touched Astro files.
- Existing JS/JSON configs use 2-space indentation; preserve it in config files.
- Keep lines readable and avoid dense one-liners for template markup.

## 4) TypeScript and typing expectations

- Respect strict typing (`astro/tsconfigs/strict`).
- Avoid `any` unless there is a documented, unavoidable boundary.
- Prefer narrow types and explicit interfaces for structured domain data.
- Validate data shape close to ingestion boundaries when adding parsing/data scripts.

## 5) Naming conventions

- Components/layouts: PascalCase file names (e.g., `MapView.astro`).
- Route files: Astro routing conventions (`index.astro`, dynamic `[slug].astro`).
- Variables/functions: camelCase.
- Constants: UPPER_SNAKE_CASE only for true constants.
- IDs/slugs should be deterministic and stable when introduced.

## 6) Error handling expectations

- Fail loudly on invalid critical data during build-time transforms.
- Provide actionable error messages with source context (file/record ID).
- For UI fallbacks, render explicit empty/error states instead of silent failure.
- Do not swallow errors in parsing/geocoding scripts; aggregate and report them.

## 7) Architecture and layering guidance

- Keep clear separation between:
  - data extraction/normalization scripts,
  - data storage artifacts,
  - UI rendering components/routes.
- Prefer static, versioned data inside repo over runtime server dependencies.
- Keep pages thin; use reusable components and utility modules as feature set grows.
- Treat `docs/Mapa de Memoria.md` as product scope reference, not as implemented state.

## 8) Contribution/testing expectations

- Every non-trivial change should include a verification note in PR/commit description.
- Run at least `npm run astro -- check` before finalizing significant changes.
- For UI changes, verify both desktop and mobile layouts in local dev server.
- If adding scripts/tooling, document exact usage in this file and `README.md`.

## Cursor and Copilot Instruction Sync

- No Cursor rules were found (`.cursor/rules/` and `.cursorrules` absent at inspection time).
- No GitHub Copilot instructions file was found (`.github/copilot-instructions.md` absent).
- If these files are added later, merge their actionable rules into this guide promptly.

## Agent Workflow Tips

- Read `docs/Mapa de Memoria.md` before implementing feature-level work.
- Confirm command availability via `package.json` before invoking tooling.
- Prefer small, reviewable patches over broad rewrites.
- Avoid introducing new dependencies unless justified by clear feature requirements.
- Keep this file updated when build/test/lint/tooling configuration changes.

## Quick Command Reference

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run astro -- check`
- `npm run astro -- sync`
- `npm run astro -- --help`

## Maintenance Rule

- When scripts/configuration change, update `AGENTS.md` in the same pull request.

# Repository Guidelines

## Project Structure & Module Organization
This repository is a small Astro static site. Keep changes close to the current layout.

- `src/pages/index.astro`: homepage markup and section structure.
- `src/layouts/BaseLayout.astro`: shared HTML shell, fonts, and metadata.
- `src/styles/style.css`: global site styles, tokens, animations, and responsive rules.
- `src/scripts/home.js`: browser-only interaction logic.
- `public/`: static assets such as icons.
- `docs/`: implementation notes, including the Astro migration constraints.
- `dist/`, `.astro/`, `node_modules/`: generated output; do not edit by hand.

## Build, Test, and Development Commands
- `npm install`: install dependencies.
- `npm run dev`: start the Astro dev server for local work.
- `npm run build`: create the production static build in `dist/`.
- `npm run preview`: serve the built output locally for final checks.

There is no separate lint or test script yet. Treat `npm run build` as the minimum required validation before opening a PR.

## Coding Style & Naming Conventions
Use simple, explicit code. Preserve the current low-abstraction approach unless a change clearly needs more structure.

- Indentation: 2 spaces in `.astro`, `.js`, and `.css`.
- JavaScript/CSS style: keep semicolons and trailing commas where the file already uses them.
- Astro components: PascalCase for layout/component files, e.g. `BaseLayout.astro`.
- CSS: keep the existing BEM-like naming pattern, e.g. `map-world__pattern`, `district--reading`.
- Avoid rewriting the homepage into many small components unless the task requires it.

## Testing Guidelines
This project currently relies on build checks and visual regression.

- Run `npm run build` on every change.
- Manually verify desktop and mobile layouts in `npm run dev` or `npm run preview`.
- For UI work, check animations, scrolling sections, and pointer interactions from `src/scripts/home.js`.
- If behavior changes, update or add notes in `docs/` when the rationale is not obvious.

## Commit & Pull Request Guidelines
Follow Conventional Commits. Current history uses a standard prefix plus a short Chinese summary, for example: `feat: 初始化博客页面`.

- Keep commits focused and small.
- PRs should explain what changed, why it changed, and any follow-up work.
- Include screenshots or short recordings for visual changes, covering desktop and mobile when relevant.
- State the validation performed, at minimum `npm run build`.

# Repository Guidelines

## Project Structure & Module Organization

- `app/` holds Next.js App Router routes, layouts, and page-level loaders; colocate route-specific UI under each segment.
- `components/`, `hooks/`, and `lib/` contain reusable UI primitives, React hooks, and shared utilities; prefer feature folders when adding new domains.
- `convex/` stores Convex backend logic (`schema.ts`, `courses.ts`, `emailActions.ts`), with types auto-generated inside `convex/_generated/`.
- Promotional data now separates percentage discounts (`courses.offer`) and BOGO campaigns (`courses.bogo`), so agents can toggle either without legacy coupling.
- `public/` exposes static assets (favicons, marketing images), while `docs/` captures architectural notes; keep large binaries in external storage.
- Ad hoc scripts like `test-rate-limit.js` live at the repo root—mirror their naming when adding new operational checks.

## Build, Test, and Development Commands

- Install dependencies with `npm install` after syncing `.env.local` (see `setup-env.sh` for required keys).
- `npm run dev` launches Next.js and Convex dev servers in parallel; open <http://localhost:3000>.
- `npm run build` compiles the production bundle; `npm start` serves it.
- `npm run lint` applies ESLint’s Next.js rules; `npm run type-check` runs `tsc --noEmit`.
- Email-related smoke tests run via `npm run test:email` or `npm run test:email:direct` against a configured Resend sandbox.

## Coding Style & Naming Conventions

- TypeScript-first codebase with 2-space indentation and Prettier + `prettier-plugin-tailwindcss`; run `npx prettier --write` on touched files.
- Favor PascalCase for React components/files, camelCase for hooks/utilities, and snake_case only inside Convex table names.
- Keep Tailwind utility groupings logical (layout → spacing → color) and prefer shared variants via `class-variance-authority`.
- Guard network calls with environment checks (see `app/page.tsx` for `NEXT_PUBLIC_CONVEX_URL` pattern).

## Testing Guidelines

- Lightweight integration scripts in the repo root rely on the local Next.js server; execute with `node test-*.js`.
- When adding tests, mirror the filename pattern (`test-<feature>.js`) and log actionable output.
- Ensure new backend logic includes Convex unit coverage via inline assertions or `convex dev` console verification.
- Target high-value paths: rate limiting, email delivery, Google Sheets sync, and payment flows.

## Commit & Pull Request Guidelines

- Follow Conventional Commit prefixes (`feat:`, `refactor:`, etc.) as seen in recent history (e.g., `feat: add email testing scripts`).
- Keep commits scoped and descriptive; reference Convex or route touchpoints in the body when relevant.
- Link issues or product specs when available and call out configuration changes requiring deploy updates.

## Security & Configuration Tips

- Never commit `.env*`; use environment variables referenced in `setup-env.sh` and Convex dashboard secrets.
- Rotate API keys after using local scripts and confirm rate-limit thresholds in `convex/rateLimit.ts` before scaling traffic.

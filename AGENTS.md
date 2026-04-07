# Repository Guidelines

## Project Structure & Module Organization

- `app/` holds Next.js App Router routes, layouts, and page-level loaders; colocate route-specific UI under each segment.
- `components/`, `hooks/`, and `lib/` contain reusable UI primitives, React hooks, and shared utilities; prefer feature folders when adding new domains.
- `convex/` stores Convex backend logic (`schema.ts`, `courses.ts`, `emailActions.ts`), with types auto-generated inside `convex/_generated/`.
- Promotional data now separates percentage discounts (`courses.offer`) and BOGO campaigns (`courses.bogo`), so agents can toggle either without legacy coupling.
- `public/` exposes static assets (favicons, marketing images), while `docs/` captures architectural notes; keep large binaries in external storage.
- Ad hoc scripts like `test-rate-limit.js` live at the repo root—mirror their naming when adding new operational checks.

## Build, Test, and Development Commands

- Install dependencies with `bun install` after syncing `.env` (see `setup-env.sh` for required keys).
- `bun dev` launches Next.js and Convex dev servers in parallel; open <http://localhost:3000>.
- `bun build` compiles the production bundle; `bun start` serves it.
- `bun lint` applies ESLint’s Next.js rules; `bun type-check` runs `tsc --noEmit`.
- Email-related smoke tests run via `bun test:email` or `bun test:email:direct` against a configured Resend sandbox.

## Coding Style & Naming Conventions

- TypeScript-first codebase with 2-space indentation and Prettier + `prettier-plugin-tailwindcss`; run `bunx prettier --write` on touched files.
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

## Cursor Cloud specific instructions

### Architecture overview

This is an npm-workspaces monorepo (`apps/web`, `apps/mobile`, `packages/*`). The primary web app is `@mindpoint/web` (Next.js 15 + App Router). The backend is Convex (cloud BaaS); there is no local database or Docker required.

### Package manager

Despite AGENTS.md mentioning `bun`, the repo declares `"packageManager": "npm@11.11.0"` and uses `package-lock.json`. Use `npm install` (not bun/pnpm/yarn) to install dependencies.

### Running the web dev server

- `npm run dev:web` starts only the Next.js web app on port 3000 (recommended for cloud agents).
- `npm run dev` starts web + mobile + Convex in parallel; skip this in cloud unless you need Convex dev sync.
- The `scripts/run-web-with-env.js` helper loads `.env` and `.env.local` from the repo root before forwarding to the `@mindpoint/web` workspace.

### Environment variables

All required secrets (Clerk, Convex, Razorpay, Resend, etc.) are injected as environment variables. The `.env.local` file only needs `CLERK_JWT_ISSUER_DOMAIN` set to the Clerk frontend API URL. The app gracefully handles missing Clerk keys via `isClerkServerConfigured()` and `CLERK_SKIP_KEY_VALIDATION`.

### Lint, type-check, and build

- `npm run lint` — ESLint via Turbo (scoped to `@mindpoint/web`)
- `npm run build` — Next.js production build (TypeScript and ESLint errors are ignored during builds via `next.config.ts`)
- Type-checking: `npm run type-check` runs tsc across web, mobile, and backend

### Convex backend

Convex functions live in `/convex/` and are deployed to the cloud. `npx convex dev` syncs local changes to a dev deployment but requires a Convex account login (interactive). For cloud agent work, the Convex backend is already deployed; agents can build/lint/run the Next.js frontend without running `convex dev`.

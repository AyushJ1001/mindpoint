# Repository Guidelines

## Project Structure & Module Organization

- `app/` holds Next.js App Router routes, layouts, and page-level loaders; colocate route-specific UI under each segment.
- `components/`, `hooks/`, and `lib/` contain reusable UI primitives, React hooks, and shared utilities; prefer feature folders when adding new domains.
- `convex/` stores Convex backend logic (`schema.ts`, `courses.ts`, `emailActions.ts`), with types auto-generated inside `convex/_generated/`.
- Promotional data now separates percentage discounts (`courses.offer`) and BOGO campaigns (`courses.bogo`), so agents can toggle either without legacy coupling.
- `public/` exposes static assets (favicons, marketing images), while `docs/` captures architectural notes; keep large binaries in external storage.
- Ad hoc scripts like `test-rate-limit.js` live at the repo root—mirror their naming when adding new operational checks.

## Build, Test, and Development Commands

- Install dependencies with `npm install` after syncing `.env` (see `setup-env.sh` for required keys).
- `npm run dev` launches the Next.js app on <http://localhost:3000>.
- `npm run dev:convex` starts Convex dev sync when needed.
- `npm run build` compiles the production bundle; `npm start` serves it.
- `npm run lint` runs ESLint; `npm run type-check` runs `tsc --noEmit`.
- `npm run type-check:convex` checks Convex functions.
- `npm run doctor` verifies that stale mobile/workspace artifacts have not returned.
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
- User-supplied UploadThing URLs (e.g. payment screenshots) are validated server-side in the Convex mutation before persisting — HTTPS, no embedded userinfo, and an UploadThing host allowlist (`sanitizeUploadThingUrl` in `convex/myFunctions.ts`). The non-admin `paymentScreenshotUploader` route is auth-gated and per-user rate-limited (`uploadRatelimit`).
- Render UploadThing-hosted images (arbitrary remote URLs) with `next/image` using the `unoptimized` prop — not a raw `<img>`. The host allowlist lives in `next.config.ts` `images.remotePatterns`; `unoptimized` skips the optimizer while keeping the component consistent across buyer and admin surfaces.

## Cursor Cloud specific instructions

### Architecture overview

This is a single root Next.js app. The web app lives in `app/`, shared UI in `components/`, reusable modules in `lib/`, and Convex functions in `convex/`. The backend is Convex (cloud BaaS); there is no local database or Docker required.

### Package manager

The repo declares `"packageManager": "npm@11.11.0"` and uses `package-lock.json`. Use `npm install` (not bun/pnpm/yarn) to install dependencies.

### Running the web dev server

- `npm run dev` starts the Next.js app on port 3000.
- `npm run dev:convex` starts Convex dev sync; skip this in cloud unless you need Convex deployment syncing.

### Environment variables

All required secrets (Clerk, Convex, Razorpay, Resend, etc.) are injected as environment variables. The `.env.local` file only needs `CLERK_JWT_ISSUER_DOMAIN` set to the Clerk frontend API URL. The app gracefully handles missing Clerk keys via `isClerkServerConfigured()` and `CLERK_SKIP_KEY_VALIDATION`.

### Lint, type-check, and build

- `npm run lint` — ESLint for the root app
- `npm run build` — Next.js production build (TypeScript and ESLint errors are ignored during builds via `next.config.ts`)
- Type-checking: `npm run type-check` runs the root Next.js app; `npm run type-check:convex` runs Convex type checks

### Convex backend

Convex functions live in `/convex/` and are deployed to the cloud. `npx convex dev` syncs local changes to a dev deployment but requires a Convex account login (interactive). For cloud agent work, the Convex backend is already deployed; agents can build/lint/run the Next.js frontend without running `convex dev`.

## Agent skills

### Issue tracker

Issues and PRDs are tracked in GitHub Issues for `AyushJ1001/mindpoint`. See `docs/agents/issue-tracker.md`.

### Triage labels

Triage uses the default canonical label vocabulary. See `docs/agents/triage-labels.md`.

### Domain docs

This repo uses a single-context domain documentation layout. See `docs/agents/domain.md`.

<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->

# Root Web App Collapse

Date: 2026-05-11

The React Native mobile exploration was removed and the repository returned to a single root Next.js application.

## What Changed

- `apps/web/*` moved back to the repository root.
- `apps/mobile` was removed.
- `packages/*` source moved into root `lib/` namespaces:
  - `lib/backend`
  - `lib/config`
  - `lib/domain`
  - `lib/services`
- Turbo and npm workspace configuration were removed.
- Vercel now builds the root app and uses `.next` as the output directory.
- Convex keeps its own pure shared helpers under `convex/_shared` instead of importing root app modules.

## Commands

- Install: `npm install`
- Develop web: `npm run dev`
- Develop Convex: `npm run dev:convex`
- Check app types: `npm run type-check`
- Check Convex types: `npm run type-check:convex`
- Verify repo shape: `npm run doctor`

## Notes

The mobile app was used only for internal exploration and was not published as a production channel. See `docs/obsolete/mobile-experiment.md` for the archival note.

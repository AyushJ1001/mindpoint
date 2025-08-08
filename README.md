# MindPoint

This repository contains The Mind Point Next.js application.

## Development

- Install dependencies: `npm install`
- Run dev: `npm run dev` (runs Next.js and Convex dev server)

## UX/UI Overhaul Work

A feature branch `feat/ux-ui-overhaul-2025-08-08` introduces accessibility improvements, design tokens usage, and performance optimizations. See `docs/ux-overhaul-notes.md` for details, including Lighthouse metrics and IA updates.

## Auditing Performance & Accessibility

- Use Chrome Lighthouse or `lighthouse` CLI against local `http://localhost:3000`.
- Check routes: `/`, `/courses`, `/courses/certificate`, `/cart`, `/contact`.
- Verify keyboard navigation and screen reader labels.

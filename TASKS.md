# Master brief (2026-10-27) — tracking

## Live now (verified against production HTML)
- ₹4,500 for CCCBT, CCPD, CCICH; catalogue patched in prod, copy merged (#246).
- No numerical seat counts anywhere public (#246, #247); admins keep them.
- `UPGRADE-INTRO-1499` and `UPGRADE-INCLP` disabled in production; the ₹999 credit is the only upgrade path.
- Consent-gated analytics (#246): GA4/Clarity only after "Allow analytics"; Meta Pixel behind an explicit flag.
- Homepage water hero, logo tokens, approved favicon emblem (#248).
- Programme pages: practical learning, recordings, certificate and credit sections (#249), copy aligned with the live policy (#251).
- Account: ₹999 credit (server-authoritative) and "Lifetime recordings included" per eligible enrolment (#250).

## Preserved, not landed
- `wip/intro-credits-full-attempt` (local branch): the larger ledger + checkout channel. Dropped after Bugbot found six real defects; do not revive as-is.
- `t3-8a960167` offer campaigns: Convex module only, no admin UI or public wiring.
- `t3-d61bc9f0` LMS materials/certificates: Convex module only.
- `t3-b7fef366` alternative course-page components: never imported.

## Constraints
- OpenCode Go usage exhausted: no delegated children. Work is landed serially by hand.
- 7 GB host: one `next build` at a time; CI covers builds.

## Still open from the brief
- Offer engine end-to-end (admin scheduling, preview, seasonal themes, checkout parity).
- LMS: notes, Drive recordings, per-student certificates (existing LMS is substantial; gaps unverified).
- Faculty credentials: shared credential line is live; names and licence details were not supplied.
- GA4/Clarity IDs (owner supplies).

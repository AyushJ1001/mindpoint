# Go-live runbook — 2027 registrations

Ordered checklist to take the site from "built" to "accepting paid 2027
registrations". Work top to bottom; **deploy Convex before the Next app**.

Run `npm run check:launch` at any point to see which required env vars are
still missing.

---

## 0. Pre-flight (local)

- [ ] `npm install`
- [ ] `npx convex dev` once, to regenerate `convex/_generated` (the repo's
      generated API types were hand-edited during development).
- [ ] `npm run type-check && npm run type-check:convex && npm run lint && npm run build`

## 1. Convex deployment

- [ ] Create / select the production Convex deployment.
- [ ] Set the **Convex** environment variables (dashboard → Settings → Env Vars,
      or `npx convex env set NAME value`):

  | Variable | Why |
  | --- | --- |
  | `CLERK_JWT_ISSUER_DOMAIN` | Convex auth (`convex/auth.config.ts`) |
  | `CHECKOUT_SERVER_SECRET` | Signs/validates checkout server requests |
  | `RESEND_API_KEY` | All transactional email |
  | `NEXT_PUBLIC_SITE_URL` | Links inside emails |
  | `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Rate limiting |
  | `GOOGLE_APPLICATION_CREDENTIALS_JSON` | Google Sheets sync (optional) |
  | `GOOGLE_SHEETS_SPREADSHEET_ID` | Google Sheets sync (optional) |
  | `GOOGLE_SHEETS_SHEET_NAME` | Sheet tab (default `Enrollments`) |

- [ ] Deploy functions + schema:
      `npx convex deploy --prod`

## 2. Next app environment (Vercel / host)

- [ ] Public: `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`,
      `NEXT_PUBLIC_SITE_URL`
- [ ] Server: `CLERK_SECRET_KEY`, `CLERK_JWT_ISSUER_DOMAIN`,
      `CHECKOUT_SERVER_SECRET` (same value as Convex), `RESEND_API_KEY`,
      `FROM_EMAIL`, `TO_EMAIL`, `CAREERS_TO_EMAIL` (optional),
      `UPLOADTHING_SECRET`, `UPLOADTHING_TOKEN`,
      `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`
- [ ] Set `CLERK_SKIP_KEY_VALIDATION=false` in production (`.env.example`
      ships it `true`).
- [ ] `npm run check:launch` passes (or every miss is intentional).

## 3. Auth + first admin

- [ ] Clerk: production instance, allowed origins include the live domain,
      Convex JWT template/issuer configured.
- [ ] Seed the **first admin** row in the `adminManagers` table (Convex
      dashboard → Data):
      `adminEmail` (lowercase), `adminName`, `isActive: true`, `addedAt`,
      `addedByAdminId`, `addedByEmail`.
- [ ] Sign in with that email, confirm `/admin` loads, then add the rest at
      `/admin/admins`.

## 4. Storefront content

- [ ] `/admin/content` — review the 9 course-category pages and the
      CBT/REBT/CBMT landing copy (all editable, saves straight to Convex).
- [ ] `/admin/settings` — confirm Convex URL and Google Sheets show as
      configured.

## 5. 2027 catalog

- [ ] Archive the courses you don't want live: `/admin/courses` → Archive
      (archived courses disappear from the site, keep their history).
- [ ] Create each new course: `/admin/courses/new` → save as **draft** →
      add a **batch** → **Publish** (batch-backed types can't publish without
      a published batch).
- [ ] Or run the CLI seeds (idempotent):
      `npx convex run bootstrapJanuaryCohort:createJanuaryCohort --prod`
      and, after confirming the `TODO confirm` price/format in
      `convex/bootstrapCbtRebtCbmt.ts`,
      `npx convex run bootstrapCbtRebtCbmt:createStandaloneCourse --prod`.
- [ ] Note: the January early-bird (₹1,999) only activates **15 Nov – 15 Dec**;
      before that the cohort charges ₹2,999.

## 6. LMS content

The January bootstrap (`bootstrapJanuaryCohort`) already seeds a **published LMS
curriculum** (one module + reading activity per course module) for each of the
three courses. See `docs/launch-courses.md`.

- [ ] `/admin/lms` (Release desk) — enrich the curricula (media/quiz/assignment/
      feedback activities, rights approval, accessible alternatives), then
      publish the new version.
- [ ] **Live Sessions** — set the meeting link per batch (shown to enrolled
      learners on `/learn`).
- [ ] Optional: **Quiz** — add questions + pass mark (required for the
      certificate when published).
- [ ] **Progress** — confirm the per-learner table loads.

## 7. Payments (do a real end-to-end test)

- [ ] Add a low-price test course/batch (or a coupon) and buy it yourself.
- [ ] UPI flow: upload screenshot → enrollment is **pending** → learner sees
      "Payment verification pending" → you receive the "payment received" email.
- [ ] `/admin/enrollments/approvals` → **Approve** → learner gets access +
      "verified" email. Test **Reject** too (cancels the enrollment).
- [ ] Confirm the price-forgery guard: a checkout with no coupon/bundle cannot
      complete at anything other than the course's current price.

## 8. Post-launch monitoring

- [ ] Work the **Payment Approvals** queue daily.
- [ ] `/admin/enrollments`, `/admin/leads`, `/admin/audit-log` for anomalies.
- [ ] Verify certificate issuance + public verification after the first
      completion.
- [ ] Consider wiring a real gateway with webhook verification so payments
      auto-approve and the manual queue shrinks to exceptions.

## Known gaps (accepted for launch)

- No payment-gateway webhook/self-healing; finalisation relies on the browser
  callback, admin approval, or admin recovery.
- WhatsApp automation is still a stub (`lib/whatsapp.ts`).

(Type checking is now enforced during `next build` — `ignoreBuildErrors` was
removed.)

# Mobile Monorepo Migration Plan

## Scope

This plan adds a React Native mobile app to the repository while preserving the existing customer-facing product behavior and all backend flows.

In scope:

- Customer-facing mobile app parity for browse, course details, cart, checkout, account, enrollments, Mind Points, referrals, contact, and careers flows where practical
- Shared backend contract across web and mobile
- Shared environment-variable contract across web, mobile, and Convex
- Monorepo restructuring needed to support multiple frontends

Out of scope for the initial rollout:

- Admin mobile parity
- Rebuilding all web-only admin upload tooling for mobile
- Major feature changes or backend workflow changes

## Goals

- Keep Convex as the single backend and source of business truth
- Keep the existing environment-variable names stable
- Minimize duplication between web and mobile
- Preserve payment, email, Google Sheets, loyalty, and referral flows
- Avoid a hard cutover by migrating in phases

## Current Constraints

The current backend is already centralized enough to support multiple frontends, but the frontend code is not.

Main blockers:

- Checkout depends on a Next API route and Next server action
- Auth and Convex providers are tied to `@clerk/nextjs`
- Shared domain logic is mixed into web components and `apps/web/app/`
- Convex generated types are imported through the web alias path
- Several flows rely on browser-only APIs and web-only libraries

Files that define the current coupling points:

- [apps/web/components/CartClient.tsx](../apps/web/components/CartClient.tsx)
- [apps/web/app/actions/payment.ts](../apps/web/app/actions/payment.ts)
- [apps/web/app/api/create-order/route.ts](../apps/web/app/api/create-order/route.ts)
- [apps/web/components/ClientProviders.tsx](../apps/web/components/ClientProviders.tsx)
- [apps/web/components/ConvexClientProvider.tsx](../apps/web/components/ConvexClientProvider.tsx)

## Target Repository Shape

```text
mindpoint/
├── apps/
│   ├── web/                 # Next.js app
│   └── mobile/              # Expo / React Native app
├── packages/
│   ├── backend/             # Shared Convex API/type entrypoints
│   ├── domain/              # Shared business logic, schemas, helpers
│   ├── config/              # Shared env parsing and platform-safe config
│   └── ui-core/             # Optional non-platform-specific UI tokens/types
├── convex/                  # Shared backend
├── docs/
└── package.json             # Workspace root
```

## Package Boundaries

### `apps/web`

- Keeps the existing Next.js product
- Owns SSR, metadata, middleware, web routing, web-only analytics, and any browser-only implementation
- Becomes a thin composition layer over shared packages where possible

### `apps/mobile`

- Expo-managed React Native app
- Uses the same Convex functions and business rules as web
- Owns mobile navigation, device storage, mobile auth bindings, and mobile payment entrypoints

### `packages/backend`

- Re-exports shared Convex generated types and API references
- Gives both apps a stable import path instead of depending on web aliases

Expected contents:

- typed exports for `api`
- typed exports for `Id`, `Doc`, and related Convex model helpers

### `packages/domain`

- Shared business logic only
- No Next.js, Expo, DOM, or React Native imports

Expected contents:

- pricing and promotion helpers
- cart item models
- checkout request and result types
- referral parsing helpers
- date and time helpers
- validation schemas

### `packages/config`

- Canonical env parsing and config helpers
- Separates secret server config from client-safe public config
- Keeps naming consistent across platforms

## Environment Variable Strategy

Environment-variable names remain stable at the repo level.

Canonical names already in use:

- `NEXT_PUBLIC_CONVEX_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_JWT_ISSUER_DOMAIN`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RESEND_API_KEY`
- `GOOGLE_APPLICATION_CREDENTIALS_JSON`
- `GOOGLE_SHEETS_SPREADSHEET_ID`
- `GOOGLE_SHEETS_SHEET_NAME`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`
- `NEXT_PUBLIC_SITE_URL`

Rules:

- Do not rename backend or existing web env vars as part of this migration
- Mobile reads from the same root env contract
- Expo-specific public env exposure should happen in `app.config.ts`, not by changing the canonical env names
- Only safe client values should be exposed to the mobile bundle

Practical implication:

- Root `.env.local` remains the source of truth for local development
- `apps/mobile/app.config.ts` maps the canonical root envs into Expo `extra`
- Convex dashboard secrets remain unchanged

## Backend Compatibility Rules

These flows must remain unchanged at the backend level:

- Course browse and filtering
- Enrollment creation
- Guest checkout
- Mind Points earn and redeem
- Referral reward application
- Email scheduling
- Google Sheets sync
- Admin-only mutations and queries

What changes:

- Frontends stop depending on web-only entrypoints to reach those flows

What does not change:

- Convex schema
- Existing Convex public function names unless there is a compelling cleanup reason
- Existing environment-variable names
- Existing side effects such as emails and Sheets sync

## Auth Strategy

Web stays on `@clerk/nextjs`.

Mobile uses Clerk’s Expo integration with secure token storage. Convex auth still uses the same Clerk-backed model and JWT template.

Requirements:

- Keep the Clerk `convex` JWT template
- Ensure both apps can request a Convex-compatible token
- Move shared auth-dependent logic out of Next-specific providers

Implementation direction:

- Web provider stays web-specific
- Mobile provider uses Expo Clerk primitives
- Shared app code consumes a platform-neutral auth interface where practical

## Payment Strategy

This is the most sensitive migration area.

Current web flow:

1. Web creates a Razorpay order through a Next API route
2. Web opens the Razorpay checkout widget
3. Web calls a Next server action after success
4. The server action calls Convex mutations to create enrollments

This cannot be reused directly by mobile.

Planned direction:

1. Move order creation behind a shared backend entrypoint that web and mobile can both call
2. Move post-payment enrollment finalization behind shared backend-facing application code
3. Keep the same Convex enrollment mutations
4. Keep web behavior unchanged during the transition by having web routes call the new shared entrypoints

Important constraint:

- Payment UX will differ between web and mobile, but the business outcome must remain identical

## Rollout Phases

### Phase 0: Planning and guardrails

- Add this migration plan
- Freeze the initial scope to customer-facing parity only
- Define acceptance criteria per flow

### Phase 1: Convert the repo into a workspace monorepo

- Add workspace configuration at the root
- Move the current Next app into `apps/web`
- Keep all root scripts working via workspace-aware commands
- Preserve Convex at the repository root

Exit criteria:

- Web app still runs
- Convex still runs
- Typecheck and lint still work from the root

### Phase 2: Extract shared packages

- Create `packages/backend`
- Create `packages/domain`
- Create `packages/config`
- Replace direct web alias imports for shared backend/domain concerns

Priority extractions:

- Convex generated API/type imports
- checkout types
- pricing and promotion logic
- cart types
- referral helpers
- env parsing

Exit criteria:

- Web behavior unchanged
- Shared package imports used from the web app
- No domain package imports depend on Next APIs or browser globals

### Phase 3: Decouple web-only backend entrypoints

- Replace direct dependence on Next server actions for checkout finalization
- Replace direct dependence on Next API routes for order creation where needed
- Keep temporary web wrappers for compatibility

Candidate targets:

- payment order creation
- contact submission
- careers submission

Exit criteria:

- Web uses shared application services instead of app-local route assumptions
- Mobile can call the same backend-facing services

### Phase 4: Bootstrap the mobile app

- Create `apps/mobile` with Expo
- Add TypeScript, navigation, Convex, and Clerk integration
- Add shared env/config plumbing
- Verify authenticated and guest data access

Exit criteria:

- Mobile app can browse courses
- Mobile app can sign in
- Mobile app can query Convex with auth

### Phase 5: Rebuild customer-facing product flows on mobile

Priority order:

1. Home and course listing
2. Course detail
3. Cart
4. Checkout
5. Account and enrollments
6. Mind Points
7. Referrals
8. Contact and careers

Notes:

- Mobile UI does not need to match web one-to-one
- Feature behavior must remain the same

Exit criteria:

- Customer-facing parity is achieved for the agreed flows

### Phase 6: Hardening and release prep

- End-to-end validation on web and mobile
- Environment validation for local, preview, and production
- Error reporting review
- Analytics review
- Documentation update

## Risks

### Payment integration differences

- Web uses `react-razorpay`
- Mobile should use `react-native-razorpay`
- Mobile cannot use the same UI entrypoint
- `react-native-razorpay` requires native modules, so it works with Expo prebuild/dev client or bare workflow, but not Expo Go
- Mobile checkout uses a different callback model than the web widget
- Android will need explicit UPI deep-link handling and verification during checkout QA
- Mitigation: isolate payment orchestration from UI invocation

### Auth/provider divergence

- Web and mobile will have different Clerk provider implementations
- Mitigation: keep shared logic below the provider layer

### Hidden browser-only logic

- Referral cookies, clipboard APIs, DOM inspection, and local storage assumptions exist today
- Mitigation: audit and move these behind platform-specific adapters

### Shared package contamination

- It is easy to accidentally import Next-only modules into shared code
- Mitigation: keep package responsibilities narrow and enforce import discipline

## Verification Checklist

Each phase should be verified against these flows:

- Browse courses and variants
- Promotion pricing and BOGO logic
- Add to cart and modify quantities
- Guest checkout
- Authenticated checkout
- Enrollment creation
- Mind Points accrual and redemption
- Referral attribution
- Contact form submission
- Careers submission

Non-functional checks:

- Web build still passes
- Mobile build runs locally
- Root typecheck passes
- Env names remain stable
- Convex deployment contract remains unchanged

## Initial Implementation Order

This is the execution order for the first code changes after planning:

1. Add workspace structure
2. Move web app into `apps/web`
3. Add `packages/backend` for Convex re-exports
4. Add `packages/domain` for checkout, cart, and pricing logic
5. Add `packages/config` for env access
6. Repoint the web app to shared packages
7. Extract checkout orchestration away from Next server actions
8. Scaffold `apps/mobile`

## Acceptance Criteria For The First Milestone

The first milestone is complete when:

- The repo is a working workspace monorepo
- The web app still behaves the same
- Shared backend and domain packages exist and are in active use
- No customer-facing behavior has changed
- The codebase is ready to add `apps/mobile` without redoing package boundaries

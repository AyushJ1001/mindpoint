# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Setup
```bash
npm install                    # Install dependencies
./setup-env.sh                 # Configure Google Sheets integration (optional)
```

### Development
```bash
npm run dev                    # Run Next.js + Convex dev servers in parallel
npm run dev:frontend           # Run only Next.js dev server
npm run dev:backend            # Run only Convex dev server
npx convex dev                 # Start Convex backend development
npx convex dashboard           # Open Convex dashboard
```

### Build & Deploy
```bash
npm run build                  # Build production bundle
npm start                      # Start production server
```

### Code Quality
```bash
npm run lint                   # Run ESLint (Next.js rules)
npm run type-check             # Run TypeScript compiler (tsc --noEmit)
npx prettier --write <file>    # Format code with Prettier + Tailwind plugin
```

### Testing
```bash
npm run test:email             # Test email via Resend (with rate limiting)
npm run test:email:direct      # Test email directly (bypass rate limiting)
node test-rate-limit.js        # Test Upstash rate limiting
node test-google-sheets.js     # Test Google Sheets integration
```

## Architecture Overview

### Stack & Framework
- **Frontend**: Next.js 15 (App Router) with React 19
- **Backend**: Convex for real-time database, queries, mutations, and actions
- **Auth**: Clerk for user authentication
- **Payments**: Razorpay integration
- **Email**: Resend for transactional emails
- **Analytics**: PostHog and Vercel Analytics
- **Styling**: Tailwind CSS 4 with class-variance-authority for component variants
- **UI Components**: Radix UI primitives

### Directory Structure

**`app/`** - Next.js App Router routes and pages
- Route segments like `/courses`, `/cart`, `/account`, `/contact`
- `layout.tsx` - Root layout with Clerk provider and global styles
- `navbar.tsx` - Main navigation with cart integration
- `footer.tsx` - Site footer
- `actions/` - Server actions (e.g., payment processing)
- `api/` - API routes (e.g., `/api/create-order` for Razorpay)

**`convex/`** - Convex backend functions
- `schema.ts` - Database schema defining all tables (courses, enrollments, reviews, mindPoints, etc.)
- `courses.ts` - Course-related queries and mutations
- `emailActions.ts` - Email sending actions via Resend
- `emailActionsWithRateLimit.ts` - Rate-limited email wrappers
- `googleSheets.ts` - Google Sheets integration for enrollment tracking
- `rateLimit.ts` - Rate limiting utilities using Upstash Redis
- `mindPoints.ts` - Loyalty points system (earn/redeem)
- `auth.config.ts` - Clerk authentication configuration
- `_generated/` - Auto-generated Convex types and API exports

**`components/`** - Reusable React components
- UI primitives from Radix UI (Button, Card, Dialog, etc.)
- Feature-specific components (CartClient, course cards, etc.)

**`hooks/`** - Custom React hooks

**`lib/`** - Shared utilities and helpers
- `convex-client-utils.ts` - Client-side Convex helpers
- `mind-points.ts` - Mind Points calculation utilities
- `rate-limit.ts` - Rate limiter instances (Upstash)
- `with-rate-limit.ts` - HOC for rate-limited API routes
- `whatsapp.ts` - WhatsApp message templates
- `utils.ts` - General utilities (cn, date formatting, etc.)
- `time-utils.ts` - Time/date utilities
- `cart-types.ts` - Cart type definitions

**`public/`** - Static assets (images, favicons, markdown content)

**`docs/`** - Architecture and setup documentation
- `google-sheets-setup.md` - Google Sheets integration guide
- `rate-limiting-setup.md` - Upstash rate limiting configuration
- `offer-functionality.md` - Course promotions and discounts
- `ux-overhaul-notes.md` - Accessibility and design token notes
- `whatsapp-automation-setup.md` - WhatsApp integration
- `supervised-email-strategy.md` - Email workflow documentation
- `therapy-pricing.md` - Pricing structure for therapy courses

### Key Concepts

#### Convex Backend Architecture
Convex provides three function types:
- **Queries**: Read-only operations (e.g., fetching courses)
- **Mutations**: Database writes (e.g., creating enrollments)
- **Actions**: External integrations (e.g., sending emails, Google Sheets updates)

All Convex functions are auto-generated into `convex/_generated/api` and imported via `api.filename.functionName`.

#### Course System
Courses have multiple types: `certificate`, `internship`, `diploma`, `pre-recorded`, `masterclass`, `therapy`, `supervised`, `resume-studio`, `worksheet`.

**Promotional System**:
- `courses.offer` - Percentage-based discounts with start/end dates
- `courses.bogo` - Buy-One-Get-One campaigns with separate date ranges
- Both can run independently without coupling

#### Enrollment Flow
1. User adds courses to cart (pricing respects active offers)
2. Guest users or authenticated users can checkout
3. Payment via Razorpay creates order
4. On payment success, enrollment records created
5. Email confirmation sent via Resend (with rate limiting)
6. Enrollment synced to Google Sheets automatically
7. Mind Points awarded for completed purchases

#### Mind Points System
- Loyalty/rewards points earned on purchases
- Can be redeemed for discount coupons
- Tracked in `mindPoints` and `pointsTransactions` tables
- Referral rewards available (`referralRewards` table)

#### Rate Limiting
Three tiers using Upstash Redis:
- **Standard**: 10 requests per 10 seconds (general API endpoints)
- **Strict**: 5 requests per minute (sensitive operations)
- **Auth**: 3 requests per 5 minutes (login/signup)

Apply via `withRateLimit()`, `withStrictRateLimit()`, or `checkConvexRateLimit()` in Convex actions.

#### Google Sheets Integration
Enrollments are automatically logged to a configured Google Sheet:
- Service account authentication via JSON credentials
- Environment variables: `GOOGLE_SHEETS_SPREADSHEET_ID`, `GOOGLE_SHEETS_SHEET_NAME`
- Asynchronous action (`googleSheets.ts`) scheduled after enrollment creation
- Graceful degradation: enrollment succeeds even if Sheets sync fails

## Environment Configuration

Required environment variables (see `setup-env.sh` for Google Sheets):
- `NEXT_PUBLIC_CONVEX_URL` - Convex deployment URL
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key
- `CLERK_SECRET_KEY` - Clerk secret key
- `RESEND_API_KEY` - Resend email API key
- `UPSTASH_REDIS_REST_URL` - Upstash Redis URL
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis token
- `RAZORPAY_KEY_ID` - Razorpay public key
- `RAZORPAY_KEY_SECRET` - Razorpay secret key
- `GOOGLE_SHEETS_SPREADSHEET_ID` - Google Sheets spreadsheet ID (optional)
- `GOOGLE_APPLICATION_CREDENTIALS_JSON` - Service account JSON for Google Sheets (production)

Convex secrets should be set via `npx convex env set KEY value` or the Convex dashboard.

## Code Style Conventions

- **TypeScript-first** with strict type checking (though `ignoreBuildErrors: true` in production for flexibility)
- **2-space indentation** with Prettier formatting
- **PascalCase** for React components and files
- **camelCase** for hooks, utilities, and functions
- **snake_case** only for Convex table names in schema
- Tailwind utilities grouped: layout → spacing → color
- Use `class-variance-authority` for component variants
- Guard network calls with environment variable checks (e.g., `if (process.env.NEXT_PUBLIC_CONVEX_URL)`)

## Testing Patterns

- **Integration tests** at repo root: `test-*.js` pattern
- Execute with `node test-<feature>.js`
- Target high-value paths: rate limiting, email delivery, Google Sheets sync, payment flows
- Convex backend logic verified via `convex dev` console or inline assertions
- Log actionable output for debugging

## Special Notes

### Date Handling
Courses use string dates (`YYYY-MM-DD` format) for start/end dates. Use `time-utils.ts` helpers for parsing and validation.

### Cart Integration
Cart uses `react-use-cart` library. Pricing logic in cart client must check for active offers (`courses.offer` or `courses.bogo`).

### Email Rate Limiting
All email actions should use rate-limited wrappers in `emailActionsWithRateLimit.ts` to prevent abuse.

### Middleware & Auth
`middleware.ts` conditionally enables Clerk auth only if keys are present. This allows builds in environments without full auth configuration.

### Build Configuration
- `next.config.ts` ignores TypeScript/ESLint errors during build for faster iteration
- Console logs removed in production (except `console.error`)
- PostHog rewrites configured for analytics proxy

## Commit Conventions

Follow Conventional Commits:
- `feat:` - New features
- `fix:` - Bug fixes
- `refactor:` - Code restructuring without behavior change
- `docs:` - Documentation updates
- `chore:` - Maintenance tasks

Keep commits scoped and descriptive. Reference Convex files or route segments when relevant.

# The Mind Point

[![Next.js](https://img.shields.io/badge/Next.js-15.2-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Convex](https://img.shields.io/badge/Convex-Backend-FF6B6B)](https://www.convex.dev/)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?logo=clerk)](https://clerk.com/)

**Empowering minds through comprehensive mental health education and professional development.**

[Live Site](https://themindpoint.org) | [Documentation](#documentation)

---

## Overview

The Mind Point is a full-stack e-commerce platform for mental health education, offering courses, certifications, therapy sessions, internships, and professional development resources. Built with modern web technologies, it provides a seamless learning experience with real-time data synchronization, secure payments, and comprehensive enrollment management.

---

## Features

### Course Marketplace

- Browse courses across multiple categories (certificates, diplomas, masterclasses, therapy, internships, and more)
- Dynamic pricing with percentage discounts and BOGO (Buy One Get One) campaigns
- Real-time countdown timers for limited-time offers
- Course modules, learning outcomes, and student reviews

### Shopping & Checkout

- Add-to-cart functionality with persistent cart state
- BOGO campaign selection modal
- Secure payment processing via Razorpay (INR)
- Guest checkout support
- Coupon code redemption

### User Accounts

- Authentication via Clerk (sign-up, sign-in, social logins)
- User profile management with WhatsApp number collection
- Enrollment history and course access
- Protected routes for enrolled content

### Mind Points Loyalty System

- Earn points on course purchases
- Redeem points for discount coupons
- Transaction history tracking
- Referral rewards program

### Enrollment Management

- Automatic enrollment number generation (format: `TMP-CODE-MMYY-XXXX`)
- Email confirmations via Resend with course-specific templates
- Google Sheets integration for administrative tracking
- Support for therapy session types (Focus/Flow/Elevate)

### Additional Features

- Markdown-rendered course content
- Video testimonials
- FAQ sections with accordions
- Mobile-responsive design
- Accessibility optimizations (WCAG guidelines)

---

## Tech Stack

### Frontend

| Technology                                        | Purpose                         |
| ------------------------------------------------- | ------------------------------- |
| [Next.js 15](https://nextjs.org/)                 | React framework with App Router |
| [React 19](https://react.dev/)                    | UI library                      |
| [TypeScript 5](https://www.typescriptlang.org/)   | Type safety                     |
| [Tailwind CSS 4](https://tailwindcss.com/)        | Utility-first styling           |
| [Radix UI](https://www.radix-ui.com/)             | Accessible UI primitives        |
| [Lucide React](https://lucide.dev/)               | Icon library                    |
| [Embla Carousel](https://www.embla-carousel.com/) | Carousel component              |

### Backend

| Technology                            | Purpose                                                               |
| ------------------------------------- | --------------------------------------------------------------------- |
| [Convex](https://www.convex.dev/)     | Backend-as-a-Service (database, serverless functions, real-time sync) |
| [Upstash Redis](https://upstash.com/) | Serverless rate limiting                                              |

### Authentication

| Technology                  | Purpose                            |
| --------------------------- | ---------------------------------- |
| [Clerk](https://clerk.com/) | User authentication and management |

### Payments

| Technology                        | Purpose                         |
| --------------------------------- | ------------------------------- |
| [Razorpay](https://razorpay.com/) | Payment gateway (Indian market) |

### Email

| Technology                    | Purpose                      |
| ----------------------------- | ---------------------------- |
| [Resend](https://resend.com/) | Transactional email delivery |

### Analytics

| Technology                                       | Purpose           |
| ------------------------------------------------ | ----------------- |
| [PostHog](https://posthog.com/)                  | Product analytics |
| [Vercel Analytics](https://vercel.com/analytics) | Web analytics     |

### External Integrations

| Technology                                                    | Purpose                         |
| ------------------------------------------------------------- | ------------------------------- |
| [Google Sheets API](https://developers.google.com/sheets/api) | Enrollment tracking spreadsheet |

---

## Project Structure

```
mindpoint/
├── app/                          # Next.js App Router
│   ├── about/                    # About page
│   ├── account/                  # User dashboard
│   ├── actions/                  # Server actions (payments)
│   ├── api/                      # API routes
│   │   ├── careers/              # Job applications
│   │   ├── contact/              # Contact form
│   │   └── create-order/         # Razorpay order creation
│   ├── careers/                  # Careers page
│   ├── cart/                     # Shopping cart
│   ├── contact/                  # Contact page
│   ├── courses/                  # Course pages
│   │   ├── [id]/                 # Dynamic course detail
│   │   ├── certificate/          # Certificate courses
│   │   ├── diploma/              # Diploma courses
│   │   ├── internship/           # Internship programs
│   │   ├── masterclass/          # Masterclass courses
│   │   ├── pre-recorded/         # Pre-recorded courses
│   │   ├── resume-studio/        # Resume services
│   │   ├── supervised/           # Supervised therapy
│   │   ├── therapy/              # Therapy sessions
│   │   └── worksheet/            # Worksheet products
│   ├── privacy/                  # Privacy policy
│   ├── refund/                   # Refund policy
│   ├── server/                   # Protected routes
│   └── toc/                      # Terms and conditions
├── components/                   # React components
│   ├── account/                  # Account-related components
│   ├── course/                   # Course display components
│   ├── therapy/                  # Therapy-specific components
│   └── ui/                       # Reusable UI primitives (shadcn/ui)
├── contexts/                     # React contexts
├── convex/                       # Convex backend
│   ├── _generated/               # Auto-generated types
│   ├── schema.ts                 # Database schema
│   ├── courses.ts                # Course queries/mutations
│   ├── emailActions.ts           # Email sending logic
│   ├── enrollments.ts            # Enrollment management
│   ├── googleSheets.ts           # Google Sheets integration
│   └── rateLimit.ts              # Rate limiting logic
├── docs/                         # Internal documentation
├── hooks/                        # Custom React hooks
├── lib/                          # Utility functions
├── public/                       # Static assets
└── types/                        # TypeScript type definitions
```

---

## Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher
- A [Convex](https://www.convex.dev/) account
- A [Clerk](https://clerk.com/) account
- A [Razorpay](https://razorpay.com/) account (for payments)
- A [Resend](https://resend.com/) account (for emails)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-org/mindpoint.git
   cd mindpoint
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory with the required variables (see [Environment Variables](#environment-variables) below).

4. **Initialize Convex**

   ```bash
   npx convex dev
   ```

   This will prompt you to log in and link your Convex project.

5. **Start the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

Create a `.env.local` file with the following variables:

### Required Variables

| Variable                            | Description                |
| ----------------------------------- | -------------------------- |
| `NEXT_PUBLIC_CONVEX_URL`            | Your Convex deployment URL |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key      |
| `CLERK_SECRET_KEY`                  | Clerk secret key           |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID`       | Razorpay key ID            |
| `RAZORPAY_KEY_SECRET`               | Razorpay secret key        |
| `RESEND_API_KEY`                    | Resend API key for emails  |

### Optional Variables

| Variable                              | Description                                 |
| ------------------------------------- | ------------------------------------------- |
| `GOOGLE_APPLICATION_CREDENTIALS_JSON` | Google service account JSON (stringified)   |
| `GOOGLE_SHEETS_SPREADSHEET_ID`        | Target Google Sheets spreadsheet ID         |
| `GOOGLE_SHEETS_SHEET_NAME`            | Sheet name (defaults to "Sheet1")           |
| `NEXT_PUBLIC_POSTHOG_KEY`             | PostHog project API key                     |
| `NEXT_PUBLIC_POSTHOG_HOST`            | PostHog host URL                            |
| `CLERK_SKIP_KEY_VALIDATION`           | Set to `true` for builds without Clerk keys |

### Convex Environment Variables

Set these in the Convex dashboard under **Settings > Environment Variables**:

- `RESEND_API_KEY`
- `GOOGLE_APPLICATION_CREDENTIALS_JSON`
- `GOOGLE_SHEETS_SPREADSHEET_ID`
- `GOOGLE_SHEETS_SHEET_NAME`

---

## Available Scripts

| Command                     | Description                                      |
| --------------------------- | ------------------------------------------------ |
| `npm run dev`               | Start Next.js and Convex dev servers in parallel |
| `npm run build`             | Create production build                          |
| `npm start`                 | Start production server                          |
| `npm run lint`              | Run ESLint                                       |
| `npm run type-check`        | Run TypeScript type checking                     |
| `npm run test:email`        | Test email functionality                         |
| `npm run test:email:direct` | Test direct email sending                        |

---

## Documentation

Internal documentation is available in the `/docs` directory:

| Document                                                          | Description                            |
| ----------------------------------------------------------------- | -------------------------------------- |
| [google-sheets-setup.md](docs/google-sheets-setup.md)             | Google Sheets API integration guide    |
| [rate-limiting-setup.md](docs/rate-limiting-setup.md)             | Upstash rate limiting configuration    |
| [offer-functionality.md](docs/offer-functionality.md)             | Discount and BOGO system documentation |
| [therapy-pricing.md](docs/therapy-pricing.md)                     | Therapy session pricing model          |
| [supervised-email-strategy.md](docs/supervised-email-strategy.md) | Email workflow for supervised therapy  |
| [ux-overhaul-notes.md](docs/ux-overhaul-notes.md)                 | Accessibility and UX improvements      |
| [whatsapp-automation-setup.md](docs/whatsapp-automation-setup.md) | WhatsApp integration notes             |

---

## Course Types

The platform supports multiple course categories:

| Type              | Description                                            |
| ----------------- | ------------------------------------------------------ |
| **Certificate**   | Professional certification courses                     |
| **Diploma**       | Comprehensive diploma programs                         |
| **Masterclass**   | Expert-led masterclass sessions                        |
| **Pre-recorded**  | Self-paced video courses                               |
| **Therapy**       | Individual therapy sessions (Focus/Flow/Elevate tiers) |
| **Supervised**    | Supervised therapy practice                            |
| **Internship**    | Hands-on internship programs                           |
| **Resume Studio** | Resume building services                               |
| **Worksheet**     | Downloadable worksheet products                        |

---

## Database Schema

The Convex database includes the following main tables:

- **courses** - Course catalog with pricing, scheduling, and content
- **enrollments** - User course enrollments with tracking
- **reviews** - Course ratings and reviews
- **userProfiles** - Extended user data
- **mindPoints** - Loyalty points balances
- **pointsTransactions** - Points earn/redeem history
- **coupons** - Discount codes
- **referralRewards** - Referral tracking

---

## Auditing Performance & Accessibility

- Use Chrome Lighthouse or the `lighthouse` CLI against `http://localhost:3000`
- Test routes: `/`, `/courses`, `/courses/certificate`, `/cart`, `/contact`
- Verify keyboard navigation and screen reader labels
- Check mobile responsiveness across breakpoints

---

## Contributing

### Commit Conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/) with these prefixes:

- `feat:` - New features
- `fix:` - Bug fixes
- `refactor:` - Code refactoring
- `docs:` - Documentation changes
- `test:` - Test additions/changes
- `chore:` - Maintenance tasks

### Coding Style

- **TypeScript-first** - All new code should be written in TypeScript
- **2-space indentation** - Configured via Prettier
- **Tailwind utility ordering** - layout → spacing → color
- **Component naming** - PascalCase for components, camelCase for hooks/utilities

### Before Submitting

```bash
npm run lint        # Check for linting errors
npm run type-check  # Verify TypeScript types
npm run build       # Ensure production build succeeds
```

---

## License

Copyright © 2026 The Mind Point. All rights reserved.

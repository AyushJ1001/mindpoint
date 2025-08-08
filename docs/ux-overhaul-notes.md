# UX/UI Overhaul Notes

## Summary of Findings

- Heuristic evaluation (Nielsen):
  - Visibility of system status: cart state visible; improved focus states added.
  - Match between system and real world: course categories clear.
  - User control and freedom: mobile menu and cart closable; skip link added.
  - Consistency and standards: unified tokens; ARIA labels for nav/cart.
  - Error prevention: form guidance TBD.
  - Recognition: clearer labels and hierarchy planned.
  - Flexibility and efficiency: keyboard navigation improved.
  - Aesthetic and minimalist: spacing/typography tokens to unify.
  - Help users recover from errors: TBD for forms.
  - Help & documentation: this doc, README.

## Task Flows Audited

- Browse courses → add to cart → checkout
- Discover TMP Academy categories
- Access policies and contact

## Information Architecture Changes

- Primary nav labels retained; added skip link and landmarks.
- Mobile menu ARIA and focus handling improved.

## Design Tokens

- Colors: defined in `app/globals.css` via OKLCH variables.
- Typography: Geist Sans/Mono, headings scaled in base layer.
- Spacing: `.container`, `.section-padding` utilities.
- Radius: `--radius`, with derived sizes.
- Shadows: `.card-shadow`, `.card-shadow-lg`.

## Component Inventory

- Core: `Button`, `Card`, `NavigationMenu`, `Sheet`, `Badge`, `Tooltip`, `Dialog`, `Select` (Radix-based).
- Patterns: Navbar, Footer, Cart sheet.

## Accessibility Changes

- Added skip link and `main` landmark with `id`.
- Added `role="navigation"` with `aria-label`.
- Added ARIA labels to menu button, cart trigger, quantity controls.
- External social links open in new tab with `rel="noopener noreferrer"`.
- Reduced motion CSS respects `prefers-reduced-motion`.

## Performance Checklist

- Next Image `priority` on logo; consider lazy-loading non-critical images.
- Fonts via Next `next/font` with `display: swap` (default).
- Tree-shaking via Next 15 defaults.
- Future work: route-level code splitting for heavy pages, image optimization.

## Metrics (Baseline vs After)

Insert Lighthouse reports/screenshots here:

- Home `/`: Perf | Access | BP | SEO
- Courses: Perf | Access | BP | SEO
- Cart: Perf | Access | BP | SEO

## Risks and Follow-ups

- Validate dynamic pages rendering for CLS.
- Add form validation messaging improvements.
- Optional Storybook setup for core components.

## Backend Adjustments (Explicit)

- Contact API email client initialization moved inside request handler to avoid build-time secrets requirement.
  - Files: `app/api/contact/route.ts`
  - Rationale: Enables successful builds in environments without `RESEND_API_KEY` while preserving runtime behavior when configured.
  - Backwards-compatibility: Yes; environment variables unchanged (`RESEND_API_KEY`, `FROM_EMAIL`, `TO_EMAIL`).

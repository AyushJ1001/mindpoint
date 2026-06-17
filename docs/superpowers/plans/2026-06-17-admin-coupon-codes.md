# Admin Coupon Codes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build admin-managed public coupon codes that can be pasted during checkout and applied according to fixed admin-defined rules.

**Architecture:** Add `adminCoupons` as a separate Convex table from Mind Points redemption coupons. Keep coupon rule evaluation in a pure TypeScript domain module and call it from Convex checkout reconciliation so payment orders and enrollment pricing use authoritative discounts.

**Tech Stack:** Next.js App Router, Convex, TypeScript, React, Tailwind, Node smoke tests.

---

### Task 1: Domain And Reconciliation

**Files:** `lib/domain/admin-coupons.ts`, `lib/domain/checkout-reconciliation.ts`, `test-checkout-reconciliation.js`

- [ ] Write failing tests for cart-level, specific-course, required-course-type, and free-course coupon behavior.
- [ ] Implement reusable admin coupon rule evaluation.
- [ ] Integrate admin coupons into checkout reconciliation after bundle pricing so cart-level coupons can affect the final price.

### Task 2: Convex Storage And Admin API

**Files:** `convex/schema.ts`, `convex/adminCoupons.ts`, `convex/checkout.ts`, `convex/_shared/checkout.ts`

- [ ] Add `adminCoupons` table and indexes.
- [ ] Add admin CRUD/list/archive mutations and public validation query.
- [ ] Load matching admin coupons by code during reconciliation.
- [ ] Allow final enrollment pricing validation to accept active admin coupons as well as existing Mind Points coupons.

### Task 3: Admin UI And Cart UI

**Files:** `app/admin/coupons/page.tsx`, `components/admin/AdminSidebar.tsx`, `components/CartClient.tsx`, `lib/services/payments.ts`, `lib/services/create-order-boundary.ts`

- [ ] Add a coupons manager page with code, status, dates, eligibility, discount target, discount type, and usage controls.
- [ ] Update checkout coupon UI to validate and preview public admin coupons or Mind Points coupons.
- [ ] Preserve existing payment and zero-cost checkout flows.

### Task 4: Verification

**Commands:** `node test-checkout-reconciliation.js`, `npm run type-check`, `npm run type-check:convex`, targeted formatting.

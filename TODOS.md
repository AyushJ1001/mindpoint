# TODOs

## Razorpay Webhook Finalization

**What:** Add Razorpay webhook handling for captured payments so checkout attempts can finalize even when the browser callback never runs.

**Why:** The incident slice will make browser/admin finalization idempotent, but automatic self-healing still needs a server-to-server webhook.

**Pros:** Captured payments can repair themselves without waiting for support; closes the exact "paid but no Convex state" failure loop.

**Cons:** Requires webhook secret config, signature verification, replay handling, and production deploy coordination.

**Context:** Implement after `checkoutAttempts` exist. The webhook should receive Razorpay payment/order events, find the matching checkout attempt by Razorpay order ID or receipt metadata, and call the same idempotent finalizer approved in the engineering review.

**Depends on / blocked by:** `checkoutAttempts` table and idempotent finalization.

## Full Checkout Quote Architecture

**What:** Replace the minimal `checkoutAttempts` incident slice with the full persisted `checkoutQuotes` architecture from the May 7 design.

**Why:** `checkoutAttempts` is intentionally a bridge. The full quote model gives cleaner quote expiration, plan hashes, payment binding, finalization states, and replay semantics.

**Pros:** Better long-term checkout foundation; clearer state machine for payment, admin recovery, and webhooks.

**Cons:** Larger schema/API/UI migration after the incident fix; needs careful rollout to avoid disrupting checkout.

**Context:** The prior design at `/Users/ayushjuvekar/.gstack/projects/AyushJ1001-mindpoint/ayushjuvekar-main-design-20260507-152323.md` defines quote creation, mismatch handling, and later finalization. Pick that work up after containment ships and production behavior has been observed.

**Depends on / blocked by:** Incident slice landing and production behavior observed.

## Split CartClient After Incident Fix

**What:** Refactor `components/CartClient.tsx` into smaller components/hooks for cart lines, pricing summary, bundle/coupon state, reconciliation, WhatsApp collection, and Razorpay handling.

**Why:** The file already owns too many responsibilities, and the incident fix adds more checkout-critical behavior.

**Pros:** Easier future checkout changes; better testability; fewer accidental regressions in payment UI.

**Cons:** Refactor churn in a high-risk file; should not be mixed with the incident behavior change.

**Context:** In the engineering review, the incident slice chose `useCartReconciliation` as the small boundary for now. A later cleanup can split the rest once server-side checkout authority is stable.

**Depends on / blocked by:** Checkout containment PR merged and verified.

## Formalize Checkout/Admin UI Vocabulary

**What:** Create a lightweight `DESIGN.md` covering cart status regions, admin form sections, badges, validation states, recovery actions, and confirmation summaries.

**Why:** The design review had to infer patterns from existing files because the repo does not currently have a formal design system document.

**Pros:** Future checkout/admin work gets consistent components and copy rules without rediscovering them from code.

**Cons:** Documentation work can distract from the incident fix if done too early.

**Context:** The current incident plan now includes enough local UI rules to implement cart reconciliation and admin paid recovery. A later `DESIGN.md` should preserve those rules for payment, admin, and recovery work after the shipped UI proves itself.

**Depends on / blocked by:** Checkout containment PR merged and verified.

# January 2027 cohort bootstrap

A one-command, idempotent way to put the January 2027 pilot cohort on sale,
without the manual admin sequence (create draft course → add a published batch
→ publish the course, which cannot be done in a single admin call).

## What it creates

- The **CCCFT** certificate course — _Relationship Psychology: Marital & Family
  Therapy_ — with its description, modules, outcomes and copy, published.
- Its **January 2027 cohort** batch, published: 12 January – 9 March 2027,
  Tuesdays & Thursdays 19:30–21:00, **capacity 30**.

Pricing follows the locked January decision ([#133](https://github.com/AyushJ1001/mindpoint/issues/133)):
full price **₹2,999**, early bird **₹1,999** until **15 December 2026**.

## Run it

From the repository root, with Convex credentials available:

```bash
# development deployment
npx convex run bootstrapJanuaryCohort:createJanuaryCohort

# production deployment
npx convex run bootstrapJanuaryCohort:createJanuaryCohort --prod
```

It is safe to re-run. The course is matched by name + type and the batch by
course + label, so existing rows are patched instead of duplicated, and the
return value reports what was created:

```json
{
  "courseId": "...",
  "batchId": "...",
  "courseCreated": true,
  "batchCreated": true
}
```

## Before you run it in production

The descriptive copy in `convex/bootstrapJanuaryCohort.ts` (description,
modules, outcomes, pain points, why-different, images) is **founder-review
copy**. Confirm or edit it, and the name/code, at the top of that file first.

The seed does not enforce the admin publish validators; it writes straight to
the tables. Keep the config publishable: a certificate needs a name, code,
type, description and at least one learning outcome, and a batch-backed course
needs at least one published batch.

## After running

- The course appears on `/courses`, `/courses/certificate`, and — because the
  batch start date is in the future — on the home page _upcoming_ row.
- Enrolment goes through the existing cart and checkout. January stays on the
  manual **UPI QR + reference form** flow; a human confirms payment and
  provisions access (see
  [#134](https://github.com/AyushJ1001/mindpoint/issues/134)).
- The course can be edited afterwards in `/admin/courses`.

## Why an internal mutation

`internalMutation` can be run from the Convex CLI and cannot be called by
clients, which is the same pattern as `convex/migrations.ts`. An admin mutation
would need a signed-in admin identity to run from the CLI.

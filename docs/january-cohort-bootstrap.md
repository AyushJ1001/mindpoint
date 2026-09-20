# January 2027 cohort bootstrap

A one-command, idempotent way to open the January 2027 certificate cohorts and
put them on sale, without the manual admin sequence (create draft course → add
a published batch → publish, which cannot be done in a single admin call).

## What it opens

Three certificate cohorts, each with the shared January schedule and pricing:

| Course                | Code    | State                                       |
| --------------------- | ------- | ------------------------------------------- |
| CBT, REBT, CBMT       | `CCCBT` | exists — content preserved                  |
| Inner Child Healing   | `CCICH` | exists — content preserved                  |
| Personality Disorders | `CCPD`  | **new** — created from the copy in the seed |

Shared cohort: **12 January – 9 March 2027**, Tuesdays & Thursdays
19:30–21:00, **capacity 30**.

Pricing follows the locked January decision ([#133](https://github.com/AyushJ1001/mindpoint/issues/133)):
full price **₹2,999**, early bird **₹1,999** until **15 December 2026**. The
schedule and capacity follow [#134](https://github.com/AyushJ1001/mindpoint/issues/134).

For the two existing courses, the seed writes **only** the January price,
offer, batch and published status — their authored description, modules and
outcomes are left untouched.

## Run it

From the repository root, with Convex credentials available:

```bash
# development deployment
npx convex run bootstrapJanuaryCohort:createJanuaryCohort

# production deployment
npx convex run bootstrapJanuaryCohort:createJanuaryCohort --prod
```

Safe to re-run: a course is matched by name (then code), a batch by course +
label, and existing rows are patched instead of duplicated. It returns what was
created:

```json
{
  "courses": [
    {
      "name": "CBT, REBT, CBMT",
      "code": "CCCBT",
      "courseCreated": false,
      "batchCreated": true
    },
    {
      "name": "Inner Child Healing",
      "code": "CCICH",
      "courseCreated": false,
      "batchCreated": true
    },
    {
      "name": "Personality Disorders",
      "code": "CCPD",
      "courseCreated": true,
      "batchCreated": true
    }
  ]
}
```

## Before you run it in production

- The **Personality Disorders** copy (description, modules, outcomes, pain
  points, why-different) is **founder-review copy** at the top of
  `convex/bootstrapJanuaryCohort.ts`. Confirm or edit it first.
- The seed writes straight to the tables and does not run the admin publish
  validators. Keep each config publishable: a certificate needs a name, code,
  type, description and at least one learning outcome.
- Setting the January price to ₹2,999 changes the course price for every
  cohort of that course, not only January. Confirm that is intended.

## After running

- Each course appears on `/courses` and `/courses/certificate`, and — because
  the batch start date is in the future — on the home page _upcoming_ row.
- Enrolment goes through the existing cart and checkout. January stays on the
  manual **UPI QR + reference form** flow; a human confirms payment and
  provisions access ([#134](https://github.com/AyushJ1001/mindpoint/issues/134)).
- Courses can be edited afterwards in `/admin/courses`.

## Why an internal mutation

`internalMutation` can be run from the Convex CLI and cannot be called by
clients, the same pattern as `convex/migrations.ts`. An admin mutation would
need a signed-in admin identity to run from the CLI.

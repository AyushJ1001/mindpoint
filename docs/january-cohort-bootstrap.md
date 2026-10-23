# January 2027 cohort bootstrap

A one-command, idempotent way to open the January 2027 certificate cohorts and
put them on sale, without the manual admin sequence (create draft course → add
a published batch → publish, which cannot be done in a single admin call).

## What it opens

The seed defines three certificate entries. Its third entry names a
**Counselling Psychology** course (`INCPSY`) that does not exist in production;
the seed matched the existing `INCLP` internship by name instead. What the seed
actually touches today:

| Seed entry            | Code      | Matches in production                          |
| --------------------- | --------- | ---------------------------------------------- |
| Inner Child Healing   | `CCICH`   | exists — content preserved                     |
| Personality Disorders | `CCPD`    | exists — content preserved                     |
| Counselling Psychology| `INCPSY`  | absent — matched `INCLP` (internship) instead  |

It writes only the January batch (and, for an entry it creates, the course
record). Authored descriptions, modules and outcomes are left untouched.

**The live January cohorts are not all from this seed.** Confirmed against
production on 14 October 2026, the launch set is `CCCBT`, `CCPD` and `CCICH`,
with per-course published cohorts rather than one shared schedule:

| Course | Code | Published cohort |
| --- | --- | --- |
| CBT, REBT and CBMT | `CCCBT` | 19 Jan – 11 Mar 2027, Tue/Thu, 30 seats |
| Personality Disorders | `CCPD` | 21 Jan – 16 Mar 2027, Tue/Thu, 30 seats |
| Inner Child Healing & Therapy | `CCICH` | 28 Jan – 23 Mar 2027, Tue/Thu, 30 seats |

The seed's stray contribution is a **draft** capacity-30 cohort on `INCLP`
(18 Jan – 17 Feb, Mon/Wed/Fri), which is not part of the launch.

**The seed does not create a curriculum.** `docs/launch-courses.md` covers what
still has to be authored in `/admin/lms` per course.

Pricing was intended to follow the locked January decision
([#133](https://github.com/AyushJ1001/mindpoint/issues/133)): full price
**₹2,999**, early bird **₹1,999** until **15 December 2026**. Production does not
hold that — the courses carry ₹3,499 and a blanket "Flat 50% OFF" campaign is
live. See [Reconcile the January cohort price and
offer](https://github.com/AyushJ1001/mindpoint/issues/227).

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

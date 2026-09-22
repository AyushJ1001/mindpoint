# Launch courses (January 2027)

Three certificate courses are defined in `convex/bootstrapJanuaryCohort.ts` and
seeded in one idempotent command. Running it publishes them on the **website**
(course page + January 2027 cohort batch + early-bird offer) **and** creates a
**published LMS curriculum** (one module + a reading activity per course module).

```
npx convex run bootstrapJanuaryCohort:createJanuaryCohort
```

(If you only have a deploy key, run it from the Convex dashboard:
**Functions → `bootstrapJanuaryCohort` → `createJanuaryCohort` → Run**.)

Safe to re-run: courses match by name/code, the batch by label, and a curriculum
is only seeded when the course has none.

## The three courses

| Course | Code | Type | Price | Cohort | Modules → LMS modules |
| --- | --- | --- | --- | --- | --- |
| CBT, REBT, CBMT | `CCCBT` | certificate | ₹2,999 (early bird ₹1,999) | Jan 12 – Mar 9, Tue/Thu 19:30–21:00, 30 seats | 8 |
| Inner Child Healing | `CCICH` | certificate | ₹2,999 (early bird ₹1,999) | same | 6 |
| Personality Disorders | `CCPD` | certificate | ₹2,999 (early bird ₹1,999) | same | 8 |

- Early-bird ₹1,999 only applies **15 Nov – 15 Dec**; before then the cohort
  charges ₹2,999.
- `certificate` is an LMS course type (`hybrid`: live + self-paced).

## What the seed gives you vs what you finish in `/admin`

**Auto-seeded (no work):**
- Course record, published, with the January price/offer and a published batch.
- A **published LMS curriculum** with one module per course module and a
  **reading activity** in each (self-confirm completion), so the LMS is usable
  immediately.

**Finish per course in the admin panel:**
1. `/admin/lms` (Release desk) — enrich the curriculum: replace the reading
   activities with **media / quiz / assignment / feedback** activities, add
   rights approval, accessible alternatives and pass marks as needed. Editing
   creates a new curriculum version; publish it when ready.
2. `/admin/courses/<id>` — add real **cover images** and review the copy.
   Offers/BOGO can be set here or via `/admin/offers`.
3. Learners get LMS access when their enrollment is activated. Manual (UPI)
   payments activate the curriculum **on admin approval** (see Payment
   Approvals); gateway payments activate automatically.

## Per-course go-live checklist

- [ ] CBT, REBT, CBMT — curriculum enriched · images · live link
- [ ] Inner Child Healing — curriculum enriched · images · live link
- [ ] Personality Disorders — curriculum enriched · images · live link
- [ ] Archive any courses that shouldn't be live (`/admin/courses` → Archive)
- [ ] Run one real UPI purchase end-to-end (see `docs/go-live-2027.md` §7)

## Notes

- The standalone **CBT, REBT & CBMT** landing page (`/courses/cbt-rebt-cbmt`)
  links to whichever certificate course matches "cbt" — once the seed has run
  it points at the live January cohort.
- Course-type pages and the catalogue cache for ~30 min; a redeploy (or the
  dev server) shows changes immediately.

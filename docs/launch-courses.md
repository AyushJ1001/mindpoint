# Launch courses (January 2027)

Three certificate cohorts are open for January 2027. Confirmed against the
production deployment on 14 October 2026, the live courses are `CCCBT`, `CCICH`
and `CCPD`, each with a **published** `January 2027 cohort` batch — capacity 30,
Tuesdays and Thursdays.

`convex/bootstrapJanuaryCohort.ts` seeds the **catalogue**: it creates course
records and batches. It does **not** create an LMS curriculum, and no January
cohort has one today. Each Course's Curriculum has to be authored and published
in `/admin/lms` before students see anything.

```
npx convex run bootstrapJanuaryCohort:createJanuaryCohort
```

(If you only have a deploy key, run it from the Convex dashboard:
**Functions → `bootstrapJanuaryCohort` → `createJanuaryCohort` → Run**.)

Safe to re-run: courses match by name/code and the batch by label. It does not
seed a curriculum, so there is nothing to skip there.

Note on the seed: its third entry defines a **Counselling Psychology** course
(`INCPSY`) that does not exist in production. The seed matched the existing
`INCLP` internship by name instead, and created a **draft** capacity-30 cohort
on it (18 Jan – 17 Feb, Mon/Wed/Fri). That cohort is not part of the launch.

## The three courses

| Course | Code | Cohort (production) |
| --- | --- | --- |
| CBT, REBT and CBMT | `CCCBT` | 19 Jan – 11 Mar 2027, Tue/Thu, 30 seats |
| Personality Disorders | `CCPD` | 21 Jan – 16 Mar 2027, Tue/Thu, 30 seats |
| Inner Child Healing & Therapy | `CCICH` | 28 Jan – 23 Mar 2027, Tue/Thu, 30 seats |

- Each runs about eight weeks.
- **Pricing is not settled in the data.** Each course carries `price: 3499`, and
  the only live offer campaign is a blanket "Flat 50% OFF" (plus live
  `UPGRADE-*` coupons worth ₹2,000). The decided January price — ₹2,999 with an
  early bird of ₹1,999 until 15 December — is not what production holds. See
  [Reconcile the January cohort price and offer with the live
  configuration](https://github.com/AyushJ1001/mindpoint/issues/227).
- `certificate` is an LMS course type (`hybrid`: live + self-paced).

## What the seed gives you vs what you finish in `/admin`

**Auto-seeded (no work):**
- The course records, published, with a published January batch.

**It does not seed a curriculum.** Finish each course in the admin panel:
1. `/admin/lms` (Release desk) — create a **Draft Curriculum** and author it:
   modules, then **media / quiz / assignment / feedback** activities, with rights
   approval, accessible alternatives and pass marks as needed. Authoring is
   create-only and append-only, so add everything in its final order. Publishing
   makes the version immutable and does not change any enrollment.
2. `/admin/courses/<id>` — add real **cover images** and review the copy.
   Offers/BOGO can be set here or via `/admin/offers`.
3. Learners get LMS access when their enrollment is activated, which for manual
   (UPI) payments happens **on admin approval** (see Payment Approvals). With no
   published Curriculum for the Course, that activation is a **silent no-op** and
   the student sees an empty workspace rather than an error.

## Per-course go-live checklist

- [ ] CBT, REBT and CBMT — curriculum authored and published · images · live link
- [ ] Personality Disorders — curriculum authored and published · images · live link
- [ ] Inner Child Healing & Therapy — curriculum authored and published · images · live link
- [ ] Activate the existing January enrollments once each curriculum is published
- [ ] Archive any courses that shouldn't be live (`/admin/courses` → Archive)
- [ ] Run one real UPI purchase end-to-end (see `docs/go-live-2027.md` §7)

## Notes

- The standalone **CBT, REBT & CBMT** landing page (`/courses/cbt-rebt-cbmt`)
  links to whichever certificate course matches "cbt" — it points at the live
  January cohort.
- Course-type pages and the catalogue cache for ~30 min; a redeploy (or the
  dev server) shows changes immediately.

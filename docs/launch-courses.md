# Launch courses (January 2027)

Three certificate courses are defined in `convex/bootstrapJanuaryCohort.ts` and
seeded in one idempotent command. Running it publishes them on the **website**
(course page + January 2027 cohort batch + early-bird offer) **and** creates
their **LMS lessons** from the module outline.

```
npx convex run bootstrapJanuaryCohort:createJanuaryCohort --prod
```

Safe to re-run: courses match by name/code, the batch by label, and lessons are
only seeded when the course has none.

## The three courses

| Course | Code | Type | Price | Cohort | Modules → lessons |
| --- | --- | --- | --- | --- | --- |
| CBT, REBT, CBMT | `CCCBT` | certificate | ₹2,999 (early bird ₹1,999) | Jan 12 – Mar 9, Tue/Thu 19:30–21:00, 30 seats | 8 |
| Inner Child Healing | `CCICH` | certificate | ₹2,999 (early bird ₹1,999) | same | 6 |
| Personality Disorders | `CCPD` | certificate | ₹2,999 (early bird ₹1,999) | same | 8 |

- Early-bird ₹1,999 only applies **15 Nov – 15 Dec**; before then the cohort
  charges ₹2,999.
- Each course is published with a published January 2027 batch and full course
  copy (description, learning outcomes, modules, outcomes, pain points,
  why-different) that already powers the course page.

## What the seed gives you vs what you finish in `/admin`

**Auto-seeded (no work):**
- Course record, published, with the January price/offer and a published batch.
- One **lesson per module** (type = text, body = the module description,
  grouped by module) so the LMS dashboard and lesson player work immediately.

**Finish per course in the admin panel:**
1. `/admin/courses/<id>/lessons` — replace each text lesson with the real
   content: set the type to **Video** (YouTube/Vimeo/mp4 URL) or **PDF**, and
   enrich the text. Add more lessons within a module if needed.
2. `/admin/courses/<id>/sessions` — set the **live class link** (Zoom/Meet) for
   the January batch. Learners see the schedule + join button on `/learn`.
3. `/admin/courses/<id>/quiz` — *(optional)* add an end-of-course quiz + pass
   mark. If published, it's required for the certificate.
4. `/admin/courses/<id>` — add real **cover images** (imageUrls) and review the
   copy. Offer/BOGO can be set here or via `/admin/offers`.

## Per-course go-live checklist

- [ ] CBT, REBT, CBMT — lessons enriched · live link set · quiz (optional) · images
- [ ] Inner Child Healing — lessons enriched · live link set · quiz (optional) · images
- [ ] Personality Disorders — lessons enriched · live link set · quiz (optional) · images
- [ ] Archive any courses that shouldn't be live (`/admin/courses` → Archive)
- [ ] Run one real UPI purchase end-to-end (see `docs/go-live-2027.md` §7)

## Notes

- The standalone **CBT, REBT & CBMT** landing page (`/courses/cbt-rebt-cbmt`)
  links to whichever certificate course matches "cbt"; once the seed has run it
  points at the live January cohort.
- Module order matters for sequential gating — keep lessons within a module
  contiguous when reordering (the admin up/down controls make this easy).

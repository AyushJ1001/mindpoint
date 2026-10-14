# PROTOTYPE — course detail, three variants

**Throwaway.** Delete once [`Port /courses/[id] to the Coastal Lagoon system`](https://github.com/AyushJ1001/mindpoint/issues/211) lands the winner.

## The plan, in one line

Three structurally different compositions of the course-detail page
(`/courses/[id]`) in the locked Coastal Lagoon look, switchable with
`?variant=A|B|C` and a floating bottom bar.

## How to open it

```
xdg-open prototypes/course-detail-coastal-lagoon/index.html
```

Append `?variant=B` (or `C`) to go straight to one. The bottom bar also cycles
with the arrow keys.

## The question each variant asks

| | Variant | Asks |
| --- | --- | --- |
| **A** | Outline-led | Does the course sell itself on its week-by-week shape? |
| **B** | Cohort-led | Does leading with dates, seats and a sticky enrol rail convert better? |
| **C** | Evidence-led | Does leading with the promise — and one honest band about what the certificate does *not* say — convert better? |

They disagree about structure, not colour: A is one column with the outline as
the centrepiece; B is a two-column page with a sticky facts rail and an
eight-week track; C is banded, centred, and ends on a "what it says / what it
does not say" comparison.

## Assumption stated up front

This is a static page rather than variants mounted on the live route, because
the app needs Clerk and Convex environment variables to render. It follows the
existing `prototypes/coastal-lagoon/` convention and copies that design
language. Every variant uses the **real CCCBT content** from the production
database and the real January cohort (19 Jan – 11 Mar 2027, Tue/Thu, 30 seats).

The week-by-week outline is **illustrative**: CCCBT has **no `modules` rows** in
production, so the real page has no outline to show today. The six weeks are the
course's six `learningOutcomes`, in order; weeks 7–8 are the practical block.
Confirm that mapping before it is treated as copy.

## Also noticed while building this

- **CCCBT's `duration` reads "4 Weeks Training + 2 Weeks Application"** — six
  weeks, not the 6+2 the January run is meant to be. Either the field is stale
  or the courses are not all eight weeks.
- **The price shown is ₹3,499**, which is what production holds, not the settled
  ₹2,999. See [Reconcile the January cohort price and
  offer](https://github.com/AyushJ1001/mindpoint/issues/227).
- The certificate wording here follows the "completion only" decision; nothing
  claims accreditation, recognition or a licence.

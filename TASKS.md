# Reach & registration growth — task list

Non-committed working checklist for the marketing/conversion push (Sept 2026).
Owner decisions taken 28 Sep 2026; see the thread.

## Inputs needed from the owner

- [ ] GA4 measurement ID (`NEXT_PUBLIC_GA_MEASUREMENT_ID`)
- [ ] Meta Pixel ID (`NEXT_PUBLIC_META_PIXEL_ID`)
- [ ] Microsoft Clarity project ID (`NEXT_PUBLIC_CLARITY_PROJECT_ID`)
- [ ] WhatsApp provider choice (Interakt / Wati / AiSensy / WhatsApp Cloud API) + key
- [ ] Free masterclass recording(s) + the short per-course preview clips
- [ ] Referral reward shape (e.g. referrer gets ₹X, friend gets ₹Y)
- [x] Intro course notes — complete set received for the four keepers
  (Criminal, Clinical Vs Counselling, Sports, Psychological First Aid). Build
  sheet at `~/mindpoint-intro-notes/TMP_Intro_Courses_Build_Sheet.md`
- [ ] Production Convex access (or run the seed commands)
- [ ] Confirm video→module mapping for Criminal (8/4) and PFA (7/3)

## Code work

- [x] Analytics scaffolding — GA4 + Meta Pixel + Clarity, env-gated
- [x] Announcement banner (new look + January cohorts + free masterclass)
- [x] Referral link surfaced — copy/share card in `/account?tab=referrals`
- [x] Programme-page CRO — price + Google rating above the fold, mobile sticky CTA
  - [ ] Extend CRO to `/courses/[id]` and course-type pages
- [x] Free masterclass landing page `/masterclass` — video slot + email/WhatsApp lead capture + FAQ schema
- [x] SEO foundation — rich structured data (Organization + 4.8 aggregateRating + WebSite + OfferCatalog + FAQPage), outcome-led homepage title/description, sitemap
- [x] Homepage "New here?" path — free masterclass + ₹999 intro above the fold
- [ ] Free preview gating — few minutes of lesson 1 behind an email/WhatsApp capture
- [x] SEO guide pages — three high-intent guides at `/resources/[slug]` (Article + FAQ schema), wired into the resources hub and sitemap
- [ ] WhatsApp capture on every form + reminder broadcasts
- [ ] Extend CRO to `/courses/[id]` and course-type pages
- [ ] Intro recordings seed (blocked on notes + prod access)
- [x] Intro recordings seed written — `convex/bootstrapIntroRecordings.ts` attaches all 27 recordings and publishes the four curricula
- [x] Module outlines — `~/mindpoint-intro-notes/TMP_Intro_Courses_Detailed_Outlines.md`
- [x] Keep only complete intros — `SELF_PACED_LIBRARY_CODES` narrowed to the four; `archiveIncompleteIntros` added

## Not this pass

- Paid ads (needs a proven offer + tracking first)
- Instagram scheduling (deferred by owner)

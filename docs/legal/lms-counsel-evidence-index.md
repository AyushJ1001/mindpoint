# Mind Point LMS counsel evidence index

Prepared on 11 September 2026 from the repository. This index helps counsel locate current product evidence. It does not decide whether any statement or implementation complies with law.

## How to use this index

Review the listed source files together with production exports, signed agreements, provider contracts, and operational records. Repository code cannot prove what the business promised through calls, chat groups, invoices, forms, or staff messages.

Do not send secrets, production credentials, private Student records, payment evidence, health information, or privileged advice through a public issue. Supply controlled copies through the counsel-approved channel.

## Public legal and policy copy

| Evidence               | Repository source                                            | Observed statement or behavior                                                                                                                                                                                                                           | Counsel ruling IDs                                                     |
| ---------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Terms and Conditions   | [`app/toc/page.tsx`](../../app/toc/page.tsx)                 | Covers Course materials, recording access, Course recognition, transfers, attendance, Certificates, termination, and strict no-extension or forfeiture rules.                                                                                            | CLM-01 to CLM-04, MIG-01 to MIG-03, TRN-01 to TRN-04, REC-01 to REC-05 |
| Privacy Policy         | [`app/privacy/page.tsx`](../../app/privacy/page.tsx)         | Combines service and newsletter purposes, treats continued use as consent, permits users under 18 with parental consent, states a general 30-day request response, names a three-month recording example, and uses broad international-transfer wording. | PRI-01 to PRI-06, RET-01 to RET-11, PRO-01 to PRO-05                   |
| Refund Policy          | [`app/refund/page.tsx`](../../app/refund/page.tsx)           | Starts from final sales, gives limited discretionary exceptions, asks for medical evidence, excludes many refunds, and sets request and processing periods.                                                                                              | MIG-01, MIG-02, TRN-01 to TRN-04                                       |
| General Course FAQ     | [`public/faq.md`](../../public/faq.md)                       | Claims recognized accreditation, career value, recordings, broad support, prompt Certificates, and a no-refund rule with Course credit.                                                                                                                  | CLM-01 to CLM-04, MIG-01 to MIG-03                                     |
| Course FAQ             | [`public/faq/course.md`](../../public/faq/course.md)         | Describes accredited digital Certificates and worldwide recording access.                                                                                                                                                                                | CLM-01 to CLM-04, REC-03, MIG-01 to MIG-03                             |
| Supervised-service FAQ | [`public/faq/supervised.md`](../../public/faq/supervised.md) | Mentions client consent, recording at the supervisor's discretion, forfeiture, and completion-hour Certificates.                                                                                                                                         | PRI-06, CLM-01, REC-01 to REC-05, TRN-01                               |

### Conflicts counsel should resolve first

- The planned LMS is adult-only, while the current Privacy Policy contemplates users under 18 with parental consent.
- The settled product model separates necessary Course messages from optional marketing, while the current Privacy Policy groups updates, newsletters, and support.
- The settled accommodation model permits reviewed extensions and equivalent routes, while current Terms contain categorical no-extension and full-attendance rules.
- The settled transfer model requires review, notice, linked source and target Enrollments, and explicit treatment of money and evidence. Current Terms use partial attendance, medical proof, forfeiture, and broad exclusions.
- The planned Certificate is proof of Course completion only. Current FAQs and Course copy contain recognition, accreditation, employer, institution, career, and worldwide-value claims that require substantiation and counsel approval.

## Course and marketing claims

| Evidence                 | Repository source                                                                      | Observed statement or behavior                                                                                                                                                        | Counsel ruling IDs                 |
| ------------------------ | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Shared Course copy       | [`lib/course-content-data.ts`](../../lib/course-content-data.ts)                       | Contains "Lifetime support," "Recognized certification," employer and institution recognition, career-opening, permanent downloads, and ongoing community or doubt-clearing promises. | CLM-01 to CLM-04, MIG-01 to MIG-03 |
| Certificate section      | [`components/course/certification.tsx`](../../components/course/certification.tsx)     | Uses professional recognition, industry-recognized expertise, and worldwide recognition language.                                                                                     | CLM-01 to CLM-04                   |
| Course purchase benefits | [`components/course/pricing-section.tsx`](../../components/course/pricing-section.tsx) | Advertises lifetime access, future updates, downloads, recordings, and Certificates.                                                                                                  | MIG-01 to MIG-03, RGT-01, RGT-05   |
| Course hero              | [`components/course/course-hero.tsx`](../../components/course/course-hero.tsx)         | Combines live classes, on-demand recordings, and an official Certificate.                                                                                                             | CLM-01, REC-01 to REC-05           |
| Certificate sample       | [`public/certificate.png`](../../public/certificate.png)                               | Current visual sample. Counsel needs a legible controlled copy and the exact issuer, accreditor, signature, claim, and identifier fields.                                             | CLM-02 to CLM-04                   |

Before review, export every current Course record from the production data source. The codebase contains shared defaults and components, but live Course names, descriptions, prices, batches, modules, prerequisites, offers, and images may differ.

## Identity, Enrollment, and payment records

| Evidence                  | Repository source                                                                                              | Observed statement or behavior                                                                                                                                                                                                                                              | Counsel ruling IDs                         |
| ------------------------- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Current data schema       | [`convex/schema.ts`](../../convex/schema.ts)                                                                   | Stores guest contact data, profiles, WhatsApp numbers, Enrollments, checkout attempts, payment identifiers, screenshots, loyalty activity, referrals, and Administrator audit history. It contains no record-specific retention schedule.                                   | PRI-01 to PRI-06, RET-01, RET-07 to RET-09 |
| Checkout implementation   | [`lib/services/checkout.ts`](../../lib/services/checkout.ts), [`convex/checkout.ts`](../../convex/checkout.ts) | Handles guest and signed-in purchases, payment state, Enrollment creation, and recovery data.                                                                                                                                                                               | PRI-01, RET-01, RET-09                     |
| Payment screenshot upload | [`app/api/uploadthing/core.ts`](../../app/api/uploadthing/core.ts)                                             | Authenticated buyers may upload payment screenshots to UploadThing. No disposal rule is attached to the upload route.                                                                                                                                                       | PRI-06, RET-09, PRO-01 to PRO-04           |
| Enrollment spreadsheet    | [`convex/_shared/enrollmentSheet.ts`](../../convex/_shared/enrollmentSheet.ts)                                 | Copies Enrollment number, Student name, email, phone, Course, session details, guest status, and dates into Google Sheets.                                                                                                                                                  | PRI-01, RET-01, PRO-01 to PRO-05           |
| Current transfer mutation | [`convex/adminEnrollments.ts`](../../convex/adminEnrollments.ts)                                               | An Administrator supplies a target Course and reason. The mutation closes the source, creates the target, and writes audit entries. It does not implement the settled transfer review, Student confirmation, price decision, Carryover mapping, or batch-capacity workflow. | MIG-01, MIG-02, TRN-01 to TRN-04           |

Counsel needs controlled exports of current Enrollment variants, guest records, transfer history, payment disputes, refunds, credits, coupons, Certificate history, and any spreadsheet copies. Hash or redact direct identifiers where the legal question does not require them.

## Communications

| Evidence                    | Repository source                                                                                                                                                                | Observed statement or behavior                                                                                                                                                             | Counsel ruling IDs                                         |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| Transactional email actions | [`convex/emailActions.ts`](../../convex/emailActions.ts), [`convex/_shared/emailDelivery.ts`](../../convex/_shared/emailDelivery.ts)                                             | Resend sends purchase, Enrollment, reminder, and other Course templates. Some actions log recipient email addresses. Worksheet emails attach files and say buyers may keep and reuse them. | PRI-01 to PRI-04, RET-07, PRO-01 to PRO-05, RGT-01, RGT-05 |
| Contact and careers routing | [`lib/config/server.ts`](../../lib/config/server.ts), [`app/api/contact/route.ts`](../../app/api/contact/route.ts), [`app/api/careers/route.ts`](../../app/api/careers/route.ts) | Resend routes messages to configured shared inboxes. Careers may fall back to the general destination.                                                                                     | PRI-01, PRI-06, RET-07, PRO-01 to PRO-04                   |
| WhatsApp collection         | [`components/whatsapp-modal.tsx`](../../components/whatsapp-modal.tsx), [`convex/schema.ts`](../../convex/schema.ts)                                                             | Checkout requests a WhatsApp number for Course updates and stores it on the user profile.                                                                                                  | PRI-02, PRI-03, RET-01, PRO-01                             |
| WhatsApp placeholder        | [`lib/whatsapp.ts`](../../lib/whatsapp.ts)                                                                                                                                       | Contains a placeholder external endpoint and logs message details. It is not an approved production provider workflow.                                                                     | PRI-02 to PRI-04, RET-07, PRO-01 to PRO-05                 |
| Direct WhatsApp contact     | [`components/course/course-footer-note.tsx`](../../components/course/course-footer-note.tsx)                                                                                     | Links users to a public WhatsApp number. Counsel should distinguish user-initiated support from Course operations and marketing.                                                           | PRI-01 to PRI-03                                           |

The provider review must use actual Resend, email-domain, WhatsApp or telecom, inbox, and suppression configurations. Repository environment-variable names do not prove the contracted entities or regions.

## Files, learning materials, and recordings

| Evidence                     | Repository source                                                                                                                                                                                                      | Observed statement or behavior                                                                                                                                                               | Counsel ruling IDs                         |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Course and worksheet uploads | [`app/api/uploadthing/core.ts`](../../app/api/uploadthing/core.ts)                                                                                                                                                     | Administrators can upload Course images and worksheet PDFs. The upload layer records the uploader but has no Rights record, licence scope, accessibility review, expiry, or disposal record. | RET-10, PRO-01 to PRO-04, RGT-01 to RGT-05 |
| Public checklist PDFs        | [`public/checklist/`](../../public/checklist/)                                                                                                                                                                         | Contains intake, consent, preparation, and observation documents. Each file needs provenance, privacy, rights, accessibility, and current-copy review.                                       | PRI-06, ACC-01 to ACC-05, RGT-01 to RGT-05 |
| Worksheet email delivery     | [`convex/emailActions.ts`](../../convex/emailActions.ts)                                                                                                                                                               | Fetches remote worksheet files, attaches them to email, and states that buyers may save and reuse them.                                                                                      | RET-10, RGT-01, RGT-04, RGT-05             |
| Current recording statements | [`app/toc/page.tsx`](../../app/toc/page.tsx), [`app/privacy/page.tsx`](../../app/privacy/page.tsx), [`public/faq/course.md`](../../public/faq/course.md), [`public/faq/supervised.md`](../../public/faq/supervised.md) | Current copy gives fixed access, a three-month retention example, worldwide availability, and supervisor discretion. These statements do not form one consistent recording rule.             | RET-11, REC-01 to REC-05                   |

The repository has no complete inventory of PDFs, books, papers, images, videos, licence evidence, provider embeds, source URLs, captions, transcripts, accessible alternatives, or recording permissions. Produce that inventory before counsel decides resource-specific use.

## Current provider evidence

The repository indicates these provider categories. Counsel needs the actual contracts and production configuration before making provider or transfer rulings.

| Provider or channel                  | Evidence                                                                                                                                                             | Known purpose                                                    | Missing controlled evidence                                                               |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Clerk                                | [`components/ClientProviders.tsx`](../../components/ClientProviders.tsx), [`convex/auth.config.ts`](../../convex/auth.config.ts)                                     | Identity and authentication                                      | Contracting entity, regions, subprocessors, retention, deletion, incident terms           |
| Convex                               | [`components/ConvexClientProvider.tsx`](../../components/ConvexClientProvider.tsx), [`convex/schema.ts`](../../convex/schema.ts)                                     | Application database, functions, and related platform processing | Deployment region, agreement, subprocessors, backups, deletion, logs, access              |
| Razorpay and manual payment channels | [`convex/checkout.ts`](../../convex/checkout.ts), [`app/actions/payment.ts`](../../app/actions/payment.ts), [`public/payment/`](../../public/payment/)               | Orders, payment identifiers, and manual payment evidence         | Merchant contract, payment-data boundary, disputes, settlement and retention terms        |
| UploadThing                          | [`app/api/uploadthing/core.ts`](../../app/api/uploadthing/core.ts)                                                                                                   | Course images, worksheet PDFs, and payment screenshots           | Storage region, processors, expiry, deletion, backups, access history                     |
| Resend and configured inboxes        | [`convex/_shared/emailDelivery.ts`](../../convex/_shared/emailDelivery.ts), [`lib/config/server.ts`](../../lib/config/server.ts)                                     | Course, contact, careers, and transaction emails                 | Contracting entity, message retention, delivery logs, regions, subprocessors, deletion    |
| Google Sheets                        | [`convex/_shared/googleSheetsClient.ts`](../../convex/_shared/googleSheetsClient.ts), [`convex/_shared/enrollmentSheet.ts`](../../convex/_shared/enrollmentSheet.ts) | Secondary Enrollment register with direct identifiers            | Account owner, access list, region, sharing, retention, deletion, backups, necessity      |
| Vercel Analytics and hosting         | [`app/layout.tsx`](../../app/layout.tsx), [`package.json`](../../package.json)                                                                                       | Web hosting and analytics                                        | Project settings, analytics data fields, regions, retention, consent behavior, agreements |
| WhatsApp                             | [`components/whatsapp-modal.tsx`](../../components/whatsapp-modal.tsx), [`lib/whatsapp.ts`](../../lib/whatsapp.ts)                                                   | Manual Course updates and unfinished automation                  | Approved provider, sender registration, templates, consent, withdrawal, delivery evidence |
| External conferencing                | No implemented provider found                                                                                                                                        | Planned live sessions                                            | Provider selection, contract, recording settings, attendance data, regions, retention     |

## Records and controls not found

This repository scan did not find implemented LMS tables or workflows for:

- purpose-specific privacy notices and Consent records;
- Privacy requests, nominations, or due-date tracking;
- record-specific Retention schedules, disposal jobs, or Legal holds;
- Provider register entries and approval history;
- Rights records, licence expiry, takedown cases, or resource restriction;
- Accommodation plans and sensitive-access logs;
- Q&A moderation, grievance, appeal, or preservation records;
- versioned Quiz attempts, Assignment submissions, grading, or completion evidence;
- LMS Certificate issuance, verification consent, replacement, suspension, or revocation;
- live-session occurrence, attendance, consent, recording, caption, or transcript records.

Absence from the repository does not prove that no external spreadsheet, form, inbox, drive, or manual process exists. Mind Point must ask each operational owner and disclose those systems to counsel.

## Controlled exports still required

Before counsel begins substantive review, collect:

- all production environment providers and regions without exposing secrets;
- current Course and batch records, purchase paths, offers, and active promises;
- historical and current versions of Terms, privacy, refunds, FAQs, forms, emails, messages, Certificates, and marketing copy;
- active Students and legacy cohorts grouped by promise type, without unnecessary direct identifiers;
- every external spreadsheet, shared inbox, drive, chat group, form, payment channel, conferencing account, and manual register;
- provider agreements, data-processing terms, subprocessor lists, licence terms, and deletion documentation;
- resource and recording inventory with source, ownership, permission, audience, access period, reuse, and accessibility evidence;
- complaints, disputes, refunds, transfers, access changes, security events, privacy requests, takedowns, and Certificate corrections;
- business entity, tax, responsible-officer, grievance, and security-contact records.

Use the ruling IDs and response table in [`lms-counsel-ruling-packet.md`](./lms-counsel-ruling-packet.md) to tie every supplied item to the questions it informs.

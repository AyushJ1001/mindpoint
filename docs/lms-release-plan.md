# Mind Point LMS implementation and release plan

Status: implementation draft. Product decisions and prototypes are complete. Counsel-dependent wording, deadlines, retention periods, provider restrictions, and legal classifications remain blocked by the approved Counsel implementation summary.

## Delivery objective

Add an adult-only, English, responsive LMS to the existing Next.js and Convex application. A Student should be able to enter one Course workspace, understand the next valid action, complete a published Curriculum, receive Faculty support, satisfy every Completion requirement, and receive a verifiable course-completion Certificate without staff assembling evidence by hand.

The first release applies to selected academic learning Courses. Therapy, worksheets, supervised services, and other Course types keep their existing flows until an Administrator opts a compatible Course into the LMS.

## Release boundaries

### MVP

The MVP includes:

- stable Identity links and safe claim of guest or manually created Enrollments;
- additive Student, Faculty, and Administrator Roles with Course or batch Faculty assignments;
- separate role dashboards that route into authoritative workspaces;
- versioned Curricula with ordered Modules and Reading, Media, External resource, Quiz, Assignment, and Feedback form activities;
- configurable release rules, prerequisites, required or optional status, and activity-specific Completion evidence;
- the Student Study desk, Course map, activity view, progress, help, and completion status;
- the Faculty Review desk for Questions, grading, Completion approval, resource work, and announcements;
- the Administrator Release desk for authoring, readiness review, immutable publication, and explicit Enrollment activation;
- versioned Quiz attempts, Assignment submissions, manual review claims, Rubrics or grading criteria, result release, corrections, resubmissions, extensions, and Student Review requests;
- public Course discussion, batch discussion, and private Student questions with scoped visibility, Official answers, moderation, and support periods;
- private identifiable Feedback and threshold-protected anonymous Feedback with separate submission receipts;
- in-app Notifications as the authoritative message record and minimal transactional email for high-impact events;
- Rights records and separate External link, supported embed, hosted copy, and adapted copy controls;
- accessibility metadata, accessible alternatives, Accommodation plans, and barrier reporting;
- Completion evaluation, audited Waivers, optional final Faculty approval, correction, Under review, and Revoked states;
- automatic Certificate eligibility and issuance after completion and name confirmation, with minimal consent-controlled public verification;
- legacy inventory, entitlement reconciliation, Draft Curriculum migration, claim reconciliation, certificate reconciliation, Activation cohorts, dry runs, pilot, rollback, and audit reports;
- the privacy, security, retention, provider, rights, accessibility, claims, and Terms gates listed below.

The MVP does not include built-in conferencing, verified live attendance, native applications, minors, multi-school tenancy, accredited qualifications, AI tutoring, plagiarism detection, proctoring, group assignments, weighted overall grades, reusable question banks, or graded transcripts.

### Release 1.1

Release 1.1 adds improvements that do not change the core learning evidence model:

- saved notes and bookmarks tied to a Student and Curriculum version;
- Course-local search across accessible content, Modules, activities, and resolved Q&A;
- calendar export and deadline subscription for released activities;
- richer operational analytics built from privacy-reviewed events;
- bulk administrative actions with preview, idempotency, per-record results, and audit history;
- specialized Faculty permission bundles only where real staffing patterns require them;
- approved bulk Student-record exports with purpose, permission, expiry, and audit controls.

### Release 2

Release 2 adds typed Live session activities:

- batch-scoped Session occurrences and schedule revisions;
- protected external join routes and access windows;
- calendar export and subscription;
- provider event ingestion when an approved provider exists;
- reviewable Attendance records with manual correction;
- make-up work and accessible equivalent routes;
- cancellation and provider-failure handling that cannot fabricate absence;
- separately governed Session recordings with Rights, privacy, captions, transcripts, audience, expiry, and reuse review.

An MVP Course may contain an optional External resource link to an event. It must not call link access verified attendance or use it as a hidden Completion requirement.

### Later evaluation

Reconsider reusable question banks, group assignments, weighted grades, graded transcripts, additional interface languages, native apps, and built-in conferencing only after MVP usage and support evidence identify a concrete need.

## Work sequence

### Stage 0: contain current launch risks

Complete these changes before exposing LMS functions to Students:

- disable the placeholder WhatsApp sender and remove message-detail logging;
- stop automatic copies of Student data to shared inboxes unless an approved purpose and access rule require them;
- inventory Google Sheets, drives, forms, inboxes, chat groups, payment channels, and manual registers containing Student data;
- classify existing email and message templates by operational, assessment, security, Certificate, or marketing purpose;
- separate marketing consent and suppression from required Course messages;
- freeze new unreviewed accreditation, recognition, professional-outcome, worldwide-value, lifetime-support, and permanent-download claims;
- inventory every Course, active batch, Enrollment, legacy promise, public claim, Certificate, file, embed, recording, and provider;
- name privacy, security, accessibility, content-rights, support, migration, and release owners;
- establish incident, grievance, privacy-request, takedown, and accessibility contacts;
- obtain the approved Counsel implementation summary before final policy copy or production launch.

Exit evidence:

- current-system inventory with source-backed counts;
- owner and provider registers;
- high-risk integrations disabled or approved;
- claim and template inventory;
- no unresolved secret or Student-data exposure in planning artifacts.

### Stage 1: widen the data model and authorization

Add new tables and functions without changing existing Student behavior.

Build these foundations:

- stable person and Identity link records separate from email addresses and Clerk identifiers;
- additive Roles and Course or batch Faculty assignments;
- Curriculum versions, Modules, typed activities, Supporting resources, release rules, and prerequisite edges;
- immutable activity and assessment version identifiers;
- Notification, Consent, Privacy request, Provider register, Retention schedule, Legal hold, Rights record, Accommodation, moderation, and sensitive-access records;
- Completion requirements, evidence references, Waivers, approvals, Completion records, and Certificates;
- audit events for every privileged or evidence-changing action;
- idempotency keys for claim, migration, publication, activation, completion, Certificate, transfer, and bulk workflows;
- permission helpers that derive identity on the server and enforce record-level scope;
- counters or bounded indexed queries for dashboard summaries and queues.

Migration rule: widen first. Existing reads and writes continue until backfills and comparisons pass. Do not rename, delete, or reinterpret existing fields in this stage.

Exit evidence:

- schema and authorization tests;
- negative permission tests across every Role and scope;
- migration jobs can pause, retry, and resume;
- audit events identify actor, action, record, reason, and before or after state where appropriate;
- no unbounded dashboard or work-queue reads.

### Stage 2: build authoring and publication

Implement the selected Release desk as production code. Do not merge the throwaway prototype directly.

Required behavior:

- Faculty and Administrators edit one Draft Curriculum version with autosave, revision tokens, conflict recovery, and version history;
- the outline, active editor, and publication-readiness queue remain visible together on desktop and stack on narrow screens;
- each blocker links to the exact activity and field that needs correction;
- typed editors cover shared fields and type-specific activity, assessment, accessibility, privacy, Rights, and Completion settings;
- Student preview uses a named Enrollment context without impersonating the Student;
- Faculty may request review but cannot publish;
- Administrators preview the exact immutable manifest before publication;
- publication and Enrollment activation are separate actions;
- published corrections follow the settled narrow correction classes; structural or instructional changes create a new Curriculum version.

Exit evidence:

- all required publication gates have automated and manual evidence;
- invalid prerequisites, missing Rights approval, critical accessibility barriers, incomplete Completion evidence, and invalid assessment settings block publication;
- concurrent edits never silently overwrite a newer revision;
- the manifest produced by preview matches the published version;
- publishing has no side effect on Enrollment assignment.

### Stage 3: build Student and Faculty workflows

Build vertical slices that finish one evidence path before starting the next:

1. Reading, Media, and External resource access, release, accessible alternatives, and Completion evidence.
2. Quizzes with autosave, submission, automatic and manual grading, result release, correction, and replacement attempts.
3. Assignments with drafts, immutable submissions, review claims, Rubrics, feedback, returned files, resubmission, closure, and Review requests.
4. Course discussion, batch discussion, private Questions, Official answers, moderation, search rules, and support periods.
5. Identifiable and anonymous Feedback with unlinkable completion receipts and minimum reporting groups.
6. Completion evaluation, Waivers, optional final approval, correction, Under review, and Revoked states.
7. Certificate name confirmation, issuance, download, minimal verification, consent, replacement, suspension, and revocation.
8. Role dashboards, Notifications, and deep links into the authoritative record for each pending action.

For every slice, ship the Student action, Faculty or Administrator review, audit record, notification, accessibility states, correction path, and failure recovery together. Do not create dashboard-only copies of workflow state.

Exit evidence:

- end-to-end tests cover each required activity type and every final state;
- manual work has one active reviewer claim and an audited reassignment path;
- held or unreleased results do not leak through progress, dashboards, Notifications, or exports;
- anonymous Feedback cannot be joined back to a response through application data;
- repeated Completion evaluation and Certificate jobs are idempotent;
- a correction never deletes prior evidence.

### Stage 4: migrate and reconcile

Run migration as an evidence-producing workflow:

1. Snapshot source counts and immutable identifiers.
2. Classify Identity links and Unclaimed, Claimed, duplicate, ambiguous, or missing Enrollment ownership.
3. Build the Legacy entitlement register from Course pages, Terms, messages, records, and staff-confirmed promises.
4. Map existing Course structures into Draft Curricula without publication.
5. Inventory and review every resource, link, embed, file, recording, accessible alternative, and Rights basis.
6. Reconcile historical Certificate facts, claims, verification, and corrections.
7. Produce per-Course publication-readiness reports.
8. Publish only reviewed Curriculum versions.
9. Create explicit Activation cohorts and preview every Enrollment change.
10. Execute a small pilot, compare results, and expand in bounded waves.

Every migration job must support dry run, checkpoint, idempotent retry, per-record outcome, source reference, and rollback. Rollback may remove new access or return routing to the legacy flow, but it must not delete Student work, submissions, messages, completion, Certificates, claims, payments, or audit evidence.

Exit evidence:

- source and destination counts reconcile by record category;
- every exception has an owner and resolution state;
- no Enrollment is activated from email matching alone;
- every activated Enrollment has one assigned Published Curriculum version and reconciled entitlement set;
- Students receive approved notice before a material change;
- rollback rehearsal preserves all Student evidence.

### Stage 5: pilot

Choose one low-complexity academic Course with a small active cohort, identified Faculty, cleared resources, accessible content, and no disputed legacy claims.

Pilot entry gates:

- Counsel implementation summary approved and applied;
- Course and Curriculum publication readiness complete;
- all pilot Enrollments reconciled and previewed;
- Faculty and support staff trained on Questions, grading, accommodations, Waivers, completion, Certificates, complaints, and incident escalation;
- Student help copy and fallback contact route published;
- monitoring, alerts, backups, rollback, and on-call ownership tested;
- keyboard, screen-reader, zoom, reflow, high-contrast, reduced-motion, and mobile checks passed on every critical journey.

Pilot hard stops:

- identity or Enrollment ownership mismatch;
- loss, duplication, or cross-Student disclosure of learning evidence;
- unauthorized access to a Course, private Question, Feedback response, Accommodation, submission, result, or Certificate identity field;
- a required inaccessible activity without an equivalent route;
- publication or access to a resource without approved Rights and audience scope;
- inaccurate Completion or Certificate issuance;
- unresolved payment or legacy-entitlement mismatch;
- missing incident, grievance, takedown, privacy, or support owner.

Pilot exit evidence:

- all hard-stop classes remain at zero or have an approved incident outcome;
- source and destination counts reconcile;
- every required workflow has at least one verified success and one tested failure path;
- Faculty queues and response targets remain operable at pilot volume;
- Student support themes are recorded without exposing sensitive content;
- release owners approve the next bounded Course wave.

### Stage 6: bounded rollout and legacy retirement

Activate Courses in small waves. Each wave repeats publication readiness, Enrollment preview, staff readiness, accessibility verification, provider checks, rollback rehearsal, and post-activation reconciliation.

Retire a legacy Course flow only when:

- every active Enrollment has a resolved destination or documented exclusion;
- access, support, assessment, completion, Certificate, payment, and transfer promises reconcile;
- all required learning evidence is available in the LMS or retained through an approved legacy route;
- legacy exports and files follow the approved Retention schedule;
- Student communications and support routes are complete;
- the rollback window has ended without an unresolved hard stop.

## Implementation workstreams

| Workstream                  | Owns                                                                                                      | Depends on                                                            |
| --------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Identity and authorization  | Identity links, claims, Roles, Faculty assignments, scoped permissions, sensitive access                  | Stage 0 inventory and approved auth provider                          |
| Curriculum and publication  | Versions, Modules, activities, release, readiness, manifests, activation                                  | Identity and authorization; Rights and accessibility rules            |
| Resources and accessibility | Rights records, delivery modes, expiry, alternatives, media metadata, barrier and Accommodation workflows | Counsel rules; provider register                                      |
| Assessments                 | Quiz attempts, Assignment versions, grading, claims, release, corrections, reviews                        | Curriculum activity model; Notifications                              |
| Discussion and Feedback     | Questions, Official answers, moderation, support periods, Feedback anonymity and reporting                | Identity, Roles, counsel classification and timelines                 |
| Completion and Certificates | Requirements, evidence, Waivers, approvals, completion lifecycle, issuance and verification               | All required activity evidence; counsel-approved claims and retention |
| Notifications               | In-app records, email delivery, preferences, suppression, announcements, failure handling                 | Consent and purpose rules; provider approval                          |
| Migration and operations    | Inventories, backfills, reconciliation, Activation cohorts, rollback, support and monitoring              | All authoritative models and launch gates                             |

Each workstream must expose its authoritative state through bounded, indexed queries. Role dashboards summarize these states and link into them; dashboards do not own mutations.

## Launch acceptance gates

### Counsel and policy

- all 52 counsel ruling IDs have an approved public implementation summary;
- current Terms, privacy, refunds, consent, grievance, accessibility, resource, recording, transfer, Certificate, and claims copy match the approved rules;
- an unresolved blocking ruling disables the affected function;
- every policy has an owner, effective version, review trigger, and prior-version archive.

### Privacy and security

- every personal-data field has a purpose, access rule, provider path, retention rule, and disposal action;
- necessary Course processing and optional marketing use separate notices and controls;
- Privacy requests, grievances, breaches, Legal holds, and provider incidents have tested workflows and due-date tracking;
- security and administrative logs follow the approved location and retention rules;
- rate limits, file validation, malware checks, short-lived delivery URLs, session protection, and least-privilege access cover critical routes;
- secrets never enter source, logs, analytics, or client bundles.

### Rights and content

- every Supporting resource has an approved Rights record for its exact version and intended audience;
- delivery, download, print, adaptation, translation, caption, transcript, territory, expiry, and reuse permissions are independent;
- broken, expired, restricted, or removed required resources have an approved accessible replacement, compatible Waiver, or release block;
- takedown, preservation, review, restoration, disposal, and repeat-uploader actions are tested and audited.

### Accessibility

- WCAG 2.2 Level AA acceptance and the approved IS 17802 mapping cover every critical Student, Faculty, Administrator, public verification, and message flow;
- automated checks, keyboard testing, representative screen-reader testing, zoom, reflow, text spacing, contrast settings, reduced motion, and mobile input all pass;
- required video has reviewed captions and transcripts, required audio has transcripts, and required documents are accessible or have equivalent alternatives;
- Accommodation requests, approved adjustments, private access, appeals, expiry, and missed-work remedies are tested;
- the accessibility statement and barrier-report route are published and staffed.

### Learning evidence

- every required activity has one published Completion requirement and defined evidence;
- evidence, assessment submissions, results, Waivers, Completion records, and Certificates preserve immutable history;
- retries, duplicate events, delayed jobs, corrections, and provider failures cannot double-complete, double-issue, or erase evidence;
- Students can see the next valid action and why a requirement is Blocked or Awaiting review;
- published results and privacy-scoped content appear only to authorized audiences.

### Migration and operations

- inventory and reconciliation reports balance against source systems;
- all Activation cohorts receive a dry-run preview and approval;
- staff runbooks cover publication, claims, transfers, grading, moderation, accommodations, Waivers, Certificates, privacy, incidents, takedowns, and rollback;
- backup and restore tests include Student work and evidence history;
- monitoring detects queue backlog, failed delivery, rights expiry, broken resources, assessment anomalies, Completion failures, and Certificate failures without exposing sensitive content.

## Required test matrix

Test each critical journey as Student, assigned Faculty, unassigned Faculty, Administrator, and unauthorized user where applicable. Cover new, loading, empty, success, failure, retry, duplicate, expired, restricted, corrected, and offline or interrupted states.

The minimum end-to-end journeys are:

- purchased and manual Enrollment claim;
- Course and batch Faculty assignment;
- Draft authoring, blocker correction, preview, publication, and later activation;
- release rules and prerequisite changes over time;
- each activity type and its Completion evidence;
- timed and untimed Quiz attempts with accommodations and manual questions;
- Assignment submission, review, release, resubmission, correction, and review request;
- public, batch, and private Questions with moderation and support closeout;
- identifiable and anonymous Feedback;
- automatic and Faculty-approved Completion, Waiver, correction, Under review, and revocation;
- Certificate name confirmation, issuance, verification, consent withdrawal, replacement, suspension, and revocation;
- Rights expiry, broken links, takedown, replacement, and required-resource continuity;
- voluntary and Administrator-initiated Enrollment transfer with Carryover mapping;
- privacy request, grievance, incident, accessibility report, and Accommodation request;
- migration dry run, partial failure, resume, activation, and rollback.

## Engineering delivery rules

- Use Conventional Commits and keep schema, backfill, behavior switch, and cleanup changes separately reviewable.
- Apply widen, migrate, compare, switch, and narrow for breaking data changes.
- Release behind Course or cohort controls. Do not use one global switch for irreversible activation.
- Require authorization in Convex functions. Client-side hiding is not a permission check.
- Use indexes and bounded pagination for feeds, queues, dashboards, audit history, and reports.
- Keep high-churn draft or presence data separate from stable records.
- Make every external side effect idempotent and record its delivery result.
- Keep generated files, signed URLs, private feedback, accommodations, moderation evidence, and legal material out of analytics.
- Store configuration values such as response targets and retention periods with an effective version. Do not bury counsel-dependent periods in UI code.
- Treat prototypes as primary design evidence. Rebuild selected variants with production state, validation, authorization, tests, and error recovery.

## Counsel reconciliation still required

The roadmap may guide engineering before counsel responds, but these items cannot reach production until the relevant ruling is approved:

| Blocked area                                                                      | Counsel ruling groups | Temporary engineering rule                                                            |
| --------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------- |
| Q&A classification, grievance, removal, appeals, preservation, and disclosure     | INT                   | Build configurable records and keep Student launch disabled                           |
| Lawful basis, notices, consent, rights, minors, sensitive data, and breach timing | PRI                   | Build purpose-specific structures; publish no final wording                           |
| Every retention minimum and disposal trigger                                      | RET                   | Keep periods configurable; do not run destructive disposal from assumptions           |
| Provider terms, regions, subprocessors, and cross-border access                   | PRO                   | Use a provider register; approve each production provider before use                  |
| Binding accessibility duties and accommodation wording                            | ACC                   | Keep WCAG 2.2 AA as the product acceptance target; do not claim legal conformance     |
| Course, accreditation, professional-outcome, and Certificate statements           | CLM                   | Remove or hold unsubstantiated claims                                                 |
| Statutory exceptions, licences, takedown, and Faculty content terms               | RGT                   | Prefer lawful links; do not publish protected hosted material without approved rights |
| Recording participation, consent, reuse, retention, and private routes            | REC                   | Keep recording functions disabled                                                     |
| Existing promises and migration remedies                                          | MIG                   | Do not activate affected legacy Enrollments until reconciled                          |
| Transfer terms, agreement, money, proof, and remedies                             | TRN                   | Do not replace settled product review with current forfeiture terms                   |

## Final completion criteria

This implementation-plan ticket can close when:

- counsel-dependent rules have an approved implementation summary and are reconciled into this plan;
- the MVP, later releases, exclusions, sequencing, owners, acceptance gates, migration, rollback, and test matrix remain internally consistent after that reconciliation;
- each Stage 0 through Stage 6 deliverable can become a bounded engineering epic with named dependencies and acceptance evidence;
- no unresolved product decision remains hidden inside an implementation ticket.

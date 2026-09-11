---
version: 1
slug: "app-prototype-faculty-workspace-page-tsx"
primary_target: "app/prototype/faculty-workspace/page.tsx"
related_targets: []
---

# Faculty workspace prototype

## Scope

Development-only responsive Faculty operations workspace at `app/prototype/faculty-workspace/page.tsx`. Operate mode. It tests triage, review, and handoff with synthetic Course data and no persistence.

## Audience and task

Assigned Faculty need to answer public and private questions, claim and grade submitted work, approve completion, see overdue commitments, and route content or policy problems without receiving Administrator-only authority.

## Direction contract

THESIS: Work arrives in one prioritized Faculty queue, then opens into a context-rich review pane. The page refuses separate dashboards that make Faculty hunt across grading, Q&A, and completion screens before they know what needs action.

OWN-WORLD: Preserve Mind Point's lavender and warm-neutral palette, Fraunces page headings, Plus Jakarta Sans controls, quiet ruled rows, restrained borders, and solid lavender actions. Status is written in plain text and supported by icons, never color alone.

STORY: Faculty choose an assigned Course, scan urgent work, claim one item, review the Student or conversation context, record a reasoned response, and return to the queue with the outcome visible.

FIRST VIEWPORT: A 224px navigation rail sits left. The center is a dense prioritized work queue with filters and clear age, Course, batch, and state columns. A 360px context pane on the right shows the selected item, Student-visible history, Rubric or question thread, and the permitted primary action. Mobile turns navigation into a menu, keeps queue rows full width, and opens the context pane as a full-page drill-in.

FORM: Queue-first review desk, ranked candidate 3 and assigned lead from seed `eca51f8d`. Alternative B is a Student dossier timeline. Alternative C is a Course operations cockpit. The memorable interaction is claiming one work item and seeing its ownership, context, deadline, and next action change together.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved decisions

The prototype does not select notification, storage, analytics, or support providers. Real authorization, concurrency, audit events, and persistence remain implementation work.

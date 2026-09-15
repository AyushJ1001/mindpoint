# LMS product preview

## Scope and mode

Operate-mode responsive preview at `app/lms/preview/page.tsx`, with production components intended to graduate into authenticated Student, Faculty, and Administrator routes.

## Audience, job, and action

Mind Point needs to inspect the complete MVP workflow before live Convex data is activated. The preview must let a viewer switch Roles, resume a Student activity, inspect Faculty work, and see publication readiness without mistaking synthetic records for production data.

## Content and constraints

Use clearly labeled synthetic Course and Student records. Preserve the approved Role desk, Student Study desk, Faculty Review desk, and Administrator Release desk interaction structures. Use the existing Mind Point lavender and warm-neutral product identity, semantic HTML, keyboard-visible controls, readable progress text, and responsive structural collapse.

## Direction

The preview opens as the product at work: a compact Role rail, one authoritative workspace, and a context pane that changes with the selected task. Avoid dashboard-card grids. Use quiet ruled rows, a single solid lavender action color, Fraunces only for workspace and activity headings, and Plus Jakarta Sans for controls and dense operational copy.

## Direction contract

- THESIS: One Course, seen through three accountable desks.
- OWN-WORLD: The preview is an uninterrupted operational workspace, not a marketing page.
- STORY: Study evidence becomes review evidence, then publication evidence.
- FIRST VIEWPORT: Course identity, all three Roles, the active task, and its consequence are visible without scrolling on desktop.
- FORM: Preserve the approved Student Study desk (seed `ddf00d31`), Faculty Review desk (seed `eca51f8d`), and selected Administrator Release desk. This composite introduces no new visual seed.

## Quality bar

Every visible primary action must either produce an honest local preview result or clearly remain disabled. Mobile must expose all three Roles without horizontal clipping. Publication blockers must navigate to their evidence source and never disappear merely because they were clicked.

## Memorable moment

Switching Role changes the work surface while preserving the same Course context: Student learning evidence becomes Faculty review evidence and then Administrator publication evidence.

## First viewport

At desktop width, a narrow Role rail, a dominant work canvas, and a contextual right rail fill the viewport below a compact synthetic-data notice. On mobile, Role selection becomes a horizontal control, the work canvas leads, and context follows inline.

## Unresolved decisions

Production providers for storage, video, analytics, and outbound messaging remain configurable implementation choices. The preview does not authorize production launch or represent real Student records.

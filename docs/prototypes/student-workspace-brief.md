# Student workspace prototype

## Scope

Development-only responsive Student learning workspace at `app/prototype/student-workspace/page.tsx`. Operate mode. It tests navigation and hierarchy with synthetic Course data and no persistence.

## Audience and task

An adult Student must resume the next required activity, understand the full Course path, use accessible learning content, ask Faculty for help, check assessment and completion state, and know what blocks the Certificate.

## Direction contract

THESIS: The Course opens directly onto the Student's current work, not a dashboard of summary cards. The workspace keeps the next valid action visible while the whole Curriculum remains within reach.

OWN-WORLD: Preserve Mind Point's lavender and warm-neutral palette, quiet ruled surfaces, Fraunces activity headings, Plus Jakarta Sans controls, restrained borders, and one solid lavender action color. Progress uses text and bars, never decorative rings.

STORY: The Student sees where they are, continues the current Reading, opens an accessible alternative or support route when needed, and understands the evidence required before the Certificate can issue.

FIRST VIEWPORT: A 264px Course map sits left, a wide Reading canvas owns the center, and a 288px support rail sits right. A compact top strip names the Course and overall progress. Previous, completion, and next actions stay at the bottom of the reading canvas. Mobile collapses to a Course outline button, full-width activity, and a bottom navigation bar.

FORM: Workbook split view, ranked candidate 3 and assigned lead from seed `ddf00d31`. Alternative B is an inline learning trail. Alternative C is a focus canvas with a compact progress dock. The memorable interaction is switching activity context without losing the visible next action.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved decisions

The prototype does not select storage, player, analytics, or notification providers. Real content and live mutations remain implementation work.

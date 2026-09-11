# Curriculum and assessment authoring prototype

Question: What workspace should let assigned Faculty build a Draft Curriculum version while Administrators retain publication control?

The prototype compares three structures on `/prototype/curriculum-authoring`:

- `?variant=A` uses the selected Release desk. It opens with publication blockers alongside the outline and active editor.
- `?variant=B` uses an Outline desk. It makes curriculum construction primary and moves readiness behind a compact alert.
- `?variant=C` uses a Journey canvas. It shows the Student sequence first and edits the selected activity below it.

The selected Release desk is recommended because rights, accessibility, grading, and completion checks can block publication. Keeping those checks beside the exact activity reduces late-stage discovery and supports a direct blocker-to-field jump. It also keeps the immutable publish manifest and later Enrollment activation visibly separate.

This is throwaway, in-memory code. It demonstrates authoring information architecture and interactions, not production data behavior.

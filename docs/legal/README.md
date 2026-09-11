# LMS legal review handoff

This folder contains the public, non-privileged materials for the Mind Point LMS legal review. It does not contain legal advice.

## Files

- [`lms-counsel-ruling-packet.md`](./lms-counsel-ruling-packet.md) gives counsel the product assumptions, questions, required answer fields, requested materials, and sign-off standard.
- [`lms-counsel-evidence-index.md`](./lms-counsel-evidence-index.md) maps current repository evidence to the ruling IDs and lists the controlled records that still need to be supplied.
- [`lms-counsel-response-workbook.md`](./lms-counsel-response-workbook.md) tracks counsel's response and the approved public implementation summary.

## Review sequence

1. Mind Point appoints qualified Indian counsel and agrees on privilege, secure transfer, scope, fees, and responsible contacts.
2. Business and operational owners supply the controlled evidence listed in the evidence index. Do not place secrets or Student records in GitHub.
3. Counsel answers every ruling ID in a private signed memo. General guidance does not complete a row.
4. Mind Point and counsel approve a non-privileged implementation summary in the response workbook.
5. Product owners transfer the approved rules into the counsel-dependent LMS decision.
6. Engineering converts each blocking rule into release criteria, tests, data migration, configuration, and operational ownership.
7. Counsel reviews the final product, public wording, provider set, and effective law before launch.

## Completion rule

The counsel task is complete only when every ruling ID has a signed private-memo reference and an approved public summary. A pending or unresolved blocking ruling keeps the affected LMS function disabled.

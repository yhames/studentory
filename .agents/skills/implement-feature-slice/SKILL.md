---
name: implement-feature-slice
description: Implement one Roadmap item or linked GitHub Issue as a vertical Studentory feature across FastAPI and React. Use for focused feature work; do not use for unrelated maintenance, issue administration, or broad speculative planning.
---

# Implement a Studentory feature slice

Deliver exactly one requested or selected `docs/ROADMAP.md` item or its linked GitHub Issue.

1. Read `PRODUCT_SPEC.md`, `docs/ROADMAP.md`, and the applicable `AGENTS.md` files. When given an Issue, read its live state and identify the matching Roadmap ID.
2. Confirm that the Issue, Roadmap, and Product Spec agree. Stop and report a material conflict instead of choosing one silently.
3. Inspect the current backend contract, known frontend consumers, and relevant tests before editing. Remove already-satisfied work from the implementation scope without weakening the acceptance criteria.
4. Refine the selected item's acceptance criteria only when needed for objective verification. Do not resolve Product Spec open questions by assumption.
5. For cross-stack work, establish the request, response, status-code, and error contract first. Then implement backend behavior and tests before updating the frontend integration and UI.
6. Keep the change limited to the selected item. Preserve unrelated working-tree changes. Use a branch name containing the Roadmap ID or Issue number when branch creation is requested.
7. Use `$verify-cross-stack` after meaningful changes. Use `$review-ui` when user-visible behavior changes.
8. Review the complete diff for correctness, scope, security, and unintended lockfile or formatting changes.
9. For a pushed branch or pull request, inspect the actual GitHub `Completion gate` and CodeQL results. Local success does not substitute for CI. If CI is unavailable, leave completion pending and report the exact external gate.
10. Mark the Roadmap item `Done` only after every acceptance criterion and required CI gate passes. Record the Issue, commands, CI and PR evidence, remaining risks, and next bottleneck in `docs/LOOP_LOG.md`.

If a high-impact product decision blocks correct implementation, mark the item `Blocked`, document the exact decision and affected behavior, and continue only with work that does not depend on that decision.

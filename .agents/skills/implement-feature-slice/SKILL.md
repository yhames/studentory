---
name: implement-feature-slice
description: Implement one roadmap item as a vertical Studentory feature across FastAPI and React. Use for feature work tied to docs/ROADMAP.md; do not use for unrelated maintenance or broad speculative planning.
---

# Implement a Studentory feature slice

Deliver exactly one requested or selected `docs/ROADMAP.md` item.

1. Read `PRODUCT_SPEC.md`, `docs/ROADMAP.md`, and the applicable `AGENTS.md` files.
2. Inspect the current backend contract, known frontend consumers, and relevant tests before editing.
3. Refine the selected item's acceptance criteria only when needed for objective verification. Do not resolve Product Spec open questions by assumption.
4. For cross-stack work, establish the request, response, status-code, and error contract first. Then implement backend behavior and tests before updating the frontend integration and UI.
5. Keep the change limited to the selected item. Preserve unrelated working-tree changes.
6. Use `$verify-cross-stack` after meaningful changes. Use `$review-ui` when user-visible behavior changes.
7. Review the complete diff for correctness, scope, security, and unintended lockfile or formatting changes.
8. For a pushed branch or pull request, inspect the actual GitHub `Completion gate`. Local success does not substitute for CI. If CI is unavailable, leave completion pending and report the exact external gate.
9. Mark the roadmap item `Done` only after every acceptance criterion and required CI gate passes. Record commands, CI evidence, remaining risks, and the next bottleneck in `docs/LOOP_LOG.md`.

If a high-impact product decision blocks correct implementation, mark the item `Blocked`, document the exact decision and affected behavior, and continue only with work that does not depend on that decision.

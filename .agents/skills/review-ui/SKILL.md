---
name: review-ui
description: Review Studentory React changes in a live browser for behavior, responsive layout, accessibility, and API failure states. Use for user-visible frontend changes after the app can run locally.
---

# Review Studentory UI

Inspect the live application rather than inferring behavior from source code alone.

Read `docs/UI_SPEC.md` before reviewing. Treat sections marked as drafts as review criteria, not permission for broad redesign. If the user has supplied reference images or approved screenshots, compare against them directly.

For each affected flow:

1. Select the relevant states from the UI Specification matrix. Do not create speculative states solely for review.
2. Verify the normal success path and relevant loading, empty, validation, submitting, and server-error states.
3. Check keyboard access, visible focus, labels, semantic controls, and focus restoration for overlays.
4. Inspect the affected states at the specified Desktop, Compact, and Mobile viewports.
5. Inspect the browser console and failed network requests.
6. Score the result with the UI Specification rubric and explain every deduction.
7. Capture concise evidence, including viewport, state, screenshot path when available, console result, and untested states.

Fail the review regardless of total score when a primary task cannot be completed by keyboard, important content is clipped, a destructive action is ambiguous, or the console contains an error caused by the change.

Fix only issues related to the requested roadmap item. Do not approve a major visual direction on the user's behalf. After UI changes, run the frontend checks through `$verify-cross-stack` and repeat the affected browser flow. During a Goal loop, record scores, evidence, remaining risks, and untested states in `docs/LOOP_LOG.md`.

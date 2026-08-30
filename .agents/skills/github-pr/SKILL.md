---
name: github-pr
description: Create or update a Studentory pull request from a focused branch, including diff review, verification evidence, Issue linkage, push, and live CI confirmation. Do not use for merging or for creating missing commits without authorization.
---

# Manage a Studentory pull request

1. Inspect the working tree, current branch, upstream, remote default branch, commits, and complete base diff.
2. Stop before creation when the current branch is the base branch, unrelated changes are mixed in, or the intended Issue and scope cannot be identified.
3. Find an existing open PR for the head branch. Update it when requested instead of creating a duplicate.
4. Require one related Issue or Roadmap item. Use `Closes #<number>` only for an issue that this PR fully resolves.
5. Run `$verify-cross-stack` for the affected scope. For user-visible changes, run `$review-ui` and include Playwright and screenshot evidence appropriate to the changed states.
6. Review `git diff --check`, the complete diff, API/data-contract impact, tests, documentation, lockfiles, generated files, secrets, and personal data.
7. Build the PR body from `.github/pull_request_template.md`. Mark only checks actually run; list omissions and risks explicitly.
8. Push the explicit head branch and create or update the PR only when the request authorizes those external mutations.
9. Read the live PR back and confirm URL, title, base/head, draft state, linked Issue, and commit SHA.
10. Inspect the actual `Completion gate` and CodeQL checks for that SHA. Pending or inaccessible checks remain pending; local success is not a substitute.

Do not merge, enable auto-merge, force-push, rewrite commits, or change repository rules without a separate request covering that action.

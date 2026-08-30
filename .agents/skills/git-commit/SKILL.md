---
name: git-commit
description: Review and commit an intended Studentory change with explicit staging and repository-compliant evidence. Use when the user asks to create a commit; do not use for pushing, pull requests, or rewriting existing commits.
---

# Commit a Studentory change

1. Read the applicable `AGENTS.md` files and inspect `git status --short --untracked-files=all` plus staged and unstaged diffs.
2. Identify the files that belong to the requested change. Preserve unrelated and pre-existing user changes; stop if they cannot be separated safely.
3. Confirm relevant verification evidence. Do not claim or imply checks that were not run.
4. Use a Conventional Commit header: `type(scope): description`. Choose `feat`, `fix`, `docs`, `test`, `refactor`, `build`, `ci`, or `chore`; use the smallest meaningful scope.
5. Include a concise body explaining why the change is needed and what it establishes when the header alone is insufficient.
6. Stage intended paths explicitly. Do not use `git add .`, broad globs, or interactive staging that could capture unrelated work.
7. Create the commit without amend unless the user explicitly requested history rewriting.
8. Read back the new commit and working-tree status, then report the commit SHA, message, included paths, verification, and remaining changes.

Do not push, force-push, reset, discard files, or create an empty commit as part of this skill.

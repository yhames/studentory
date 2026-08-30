---
name: ci-failure-loop
description: Diagnose and fix a failing Studentory GitHub Actions check from its actual run and job logs. Use when CI, CodeQL, or a required completion gate fails; do not use for unpushed local failures.
---

# Resolve a Studentory CI failure

Work from the failing GitHub run, not from assumptions.

1. Identify the repository, commit SHA, workflow run, failing job, and failing step.
2. Read the actual job log. If GitHub access or logs are unavailable, stop and report the missing evidence instead of guessing.
3. Classify the failure as application code, test expectation, dependency, workflow configuration, runner environment, flaky behavior, or external service.
4. Reproduce the smallest failing command locally when practical.
5. Fix the root cause with the smallest scoped change. Do not weaken tests or checks merely to make CI green.
6. Run the targeted local check, then `$verify-cross-stack` for the affected scope.
7. Review the diff and push only when the user's workflow authorizes it.
8. Inspect the new GitHub run and require `Completion gate` to pass. A local pass or queued rerun is not completion.

For CodeQL or security alerts, confirm the repository is eligible and the workflow is authorized before changing application code. Distinguish a configuration or licensing failure from a code finding.

Record the failing run, root cause, commands, new run, and final check state in `docs/LOOP_LOG.md` during a Goal loop.

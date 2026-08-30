# CI and Security Gates

## Completion gate

Local verification provides fast feedback but does not make a branch merge-ready. For a pushed branch or pull request, GitHub Actions is the final completion gate.

Required check:

- `Completion gate`

It succeeds only after:

- backend formatting, lint, type-check, and tests pass
- frontend lint, type-check, and build pass

Configure the `main` branch ruleset to require `Completion gate` before merge. Do not mark a Goal complete when its required CI run is failing or still running. If the branch cannot be pushed or GitHub cannot be inspected, report CI as pending rather than passed.

Playwright is not part of the gate yet because this repository has no Playwright dependency or test suite. Add an E2E job to `CI` and make `Completion gate` depend on it after a stable critical-flow suite exists.

## Dependency feedback

`.github/dependabot.yml` checks these ecosystems weekly:

- GitHub Actions
- backend uv dependencies
- frontend pnpm dependencies through the npm ecosystem

Review dependency pull requests before merging. Inspect compatibility impact and lockfile changes, then require the normal CI gate. Do not merge broad upgrades solely because Dependabot opened them.

## Code scanning

`.github/workflows/codeql.yml` analyzes Python and JavaScript/TypeScript on pull requests, pushes to `main`, and weekly. It requires GitHub Code Security eligibility. If the repository cannot use advanced setup, enable CodeQL default setup in GitHub and remove the workflow instead of keeping a permanently failing check.

## Repository settings

The following settings cannot be guaranteed by committed files. A repository administrator must verify them in GitHub:

- [ ] Actions are enabled.
- [ ] The `main` ruleset requires `Completion gate`.
- [ ] Require branches to be up to date before merging, if appropriate for the team.
- [ ] Dependabot alerts and security updates are enabled.
- [ ] Secret scanning is enabled or confirmed automatic for the repository visibility.
- [ ] Push protection is enabled.
- [ ] CodeQL advanced setup is eligible and its first run succeeds, or default setup is enabled instead.
- [ ] The GitHub plugin has access to `yhames/studentory` so Codex can inspect actual checks and logs.

## Failure handling

Use `$ci-failure-loop` for a failing GitHub check. Inspect the actual run and logs before changing code. Reproduce locally when practical, make the smallest root-cause fix, rerun local verification, then inspect the new GitHub run.

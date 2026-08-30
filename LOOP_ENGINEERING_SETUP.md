# Studentory — Codex Loop Engineering Setup

## Objective

Configure this repository so Codex works as an engineering agent that repeatedly:

```text
Understand
→ Inspect
→ Plan
→ Implement
→ Test
→ Run
→ Observe
→ Review
→ Fix
→ Verify
```

The goal is **not** maximum autonomy.

The goal is:

> Short, observable, reproducible, and verifiable engineering loops.

Do not consider a task complete merely because code was generated.

---

# 1. Existing Tooling

The project already uses or plans to use:

* GitHub
* Sentry
* Playwright
* Project-specific Codex Skills

Treat these tools as feedback sources.

```text
Requirements
     ↓
   Codex
     ↓
 Source Code
     ↓
 Unit / Integration Tests
     ↓
 Playwright
     ↓
 Runtime
     ↓
 Sentry
     ↓
 GitHub CI / PR
     ↓
   Codex
```

---

# 2. GitHub

GitHub is the source of truth for:

* source code
* Issues
* Pull Requests
* CI results
* review history
* release history

When a task originates from GitHub:

```text
Issue
→ Understand acceptance criteria
→ Inspect related code
→ Implement
→ Test
→ Review diff
→ Run CI
→ Fix failures
→ Verify
→ PR
```

Never claim a GitHub Action or CI check passed unless the actual result was inspected.

---

# 3. Playwright

Use Playwright as the browser-level verification layer.

Playwright should validate actual user behavior rather than implementation details.

Typical loop:

```text
Feature
→ implementation
→ app start
→ browser open
→ user interaction
→ observe UI
→ observe console
→ observe network
→ assertion
```

If verification fails:

```text
Failure
→ collect evidence
→ identify root cause
→ minimal fix
→ rerun targeted test
```

Do not immediately rewrite large parts of the feature.

---

## What Playwright should verify

Prefer scenarios such as:

* page navigation
* authentication flows
* form submission
* validation messages
* loading states
* error states
* persisted state
* API integration
* important user journeys

Avoid large numbers of brittle selectors.

Prefer:

```text
role
label
accessible name
test id
```

over DOM structure selectors.

---

# 4. Sentry

Use Sentry as production/runtime feedback.

Debugging loop:

```text
Sentry Issue
→ stack trace
→ breadcrumbs/context
→ related code
→ reproduce
→ regression test
→ root-cause fix
→ verification
```

Do not fix an exception by suppressing it unless suppression is the intended behavior.

Prefer fixing the underlying cause.

When investigating a Sentry issue, determine:

* affected version
* frequency
* affected route/component
* triggering input/state
* first occurrence
* regression possibility
* root cause

---

# 5. REQUIRED ADDITION — CI as Completion Gate

GitHub Actions should be treated as a mandatory completion gate.

Codex must not consider work complete while required CI is red.

Recommended CI stages:

```text
install
↓
format-check
↓
lint
↓
type-check
↓
unit-test
↓
integration-test
↓
build
↓
e2e
```

Not every repository needs all stages.

Inspect the actual project and configure only applicable stages.

For pull requests, prioritize fast feedback:

```text
PR
├── lint
├── type-check
├── unit tests
└── build
```

Run expensive E2E tests separately if necessary.

---

# 6. REQUIRED ADDITION — Dependency and Security Feedback

Enable repository-level dependency/security checks.

Recommended GitHub features:

* Dependabot
* GitHub dependency alerts
* Secret scanning
* CodeQL if appropriate for the project's language

These are not substitutes for normal tests.

Their role is:

```text
dependency change
→ automated analysis
→ finding
→ Codex inspection
→ minimal remediation
→ tests
→ verification
```

Codex must not blindly upgrade every dependency.

For dependency updates:

1. inspect changelog when necessary
2. identify compatibility impact
3. update smallest dependency scope
4. run affected tests
5. inspect generated lockfile diff

---

# 7. OPTIONAL — Database Tool

Add a database integration only if Studentory actually uses the corresponding platform.

Examples:

```text
Supabase
Neon Postgres
```

Do NOT add database tools solely because they are available.

Database feedback is useful for:

* schema inspection
* migration debugging
* constraint validation
* query inspection
* data integration testing

Database loop:

```text
model change
→ migration
→ apply migration
→ inspect schema
→ integration test
→ rollback/forward compatibility review
```

Production data must never be modified merely to make a test pass.

---

# 8. OPTIONAL — Linear

Add Linear only if Studentory tasks are actually managed there.

If GitHub Issues already serve as the task tracker, do not duplicate the workflow.

Preferred rule:

```text
One source of truth for tasks.
```

Either:

```text
GitHub Issues
```

or:

```text
Linear
```

Avoid maintaining the same specification manually in both systems.

---

# 9. OPTIONAL — Documentation Source

Use Notion only when product requirements actually live in Notion.

Otherwise repository documentation should remain the primary technical source.

Recommended repository documentation:

```text
docs/
├── architecture.md
├── development.md
├── testing.md
└── decisions/
    ├── 0001-....md
    └── ...
```

Use ADRs for decisions that materially affect architecture.

Do not create ADRs for trivial implementation choices.

---

# 10. Project Skills

Inspect the existing `.agents/skills` directory before creating duplicates.

Recommended minimal Skill set:

```text
.agents/
└── skills/
    ├── feature-loop/
    │   └── SKILL.md
    │
    ├── bugfix-loop/
    │   └── SKILL.md
    │
    ├── e2e-loop/
    │   └── SKILL.md
    │
    ├── review-loop/
    │   └── SKILL.md
    │
    └── ci-failure-loop/
        └── SKILL.md
```

Do not create a skill when `AGENTS.md` can express the rule more simply.

Skills should represent reusable workflows rather than generic coding advice.

---

# 11. Feature Loop

```text
Requirement
↓
Inspect
↓
Plan
↓
Implement
↓
Targeted Test
↓
Static Checks
↓
Browser Verification
↓
Diff Review
↓
CI
↓
Done
```

Completion condition:

```text
requested behavior satisfied
AND
relevant tests pass
AND
relevant static checks pass
AND
build passes
AND
important user flow works
AND
no actionable review findings remain
```

---

# 12. Bugfix Loop

For bugs:

```text
Observe
↓
Reproduce
↓
Hypothesize
↓
Test hypothesis
↓
Identify root cause
↓
Add regression test
↓
Fix
↓
Verify
```

Prefer:

```text
failing test
→ fix
→ passing test
```

when practical.

Do not use random trial-and-error edits.

---

# 13. E2E Loop

Use for features visible through the web application.

Workflow:

```text
start application
↓
navigate with Playwright
↓
perform realistic user action
↓
inspect result
↓
inspect browser console
↓
inspect failed network requests
↓
fix
↓
repeat
```

Browser success alone is insufficient if console errors or failed requests remain.

---

# 14. CI Failure Loop

When CI fails:

```text
Read failing job
↓
Read actual error output
↓
Determine whether failure is:
    code
    test
    environment
    dependency
    configuration
↓
Reproduce locally when possible
↓
Fix root cause
↓
Run smallest affected verification
↓
Run broader verification
```

Never modify tests merely to make CI green unless the test expectation itself is incorrect.

---

# 15. Review Loop

Before considering a task finished, review the complete diff.

Check:

### Correctness

* Does the implementation satisfy the requirement?
* Are boundary cases handled?
* Are failure states handled?

### Architecture

* Are module boundaries preserved?
* Is dependency direction preserved?
* Was unnecessary coupling introduced?

### Complexity

* Is there duplicate logic?
* Is there premature abstraction?
* Can the implementation be simpler?

### Security

* Are credentials exposed?
* Is user input validated where necessary?
* Are authentication/authorization assumptions safe?

### Testing

* Does the test verify behavior?
* Is there an important untested regression path?

### Scope

* Are unrelated files changed?
* Are lockfile changes expected?
* Was accidental formatting churn introduced?

---

# 16. AGENTS.md Rules

Ensure root `AGENTS.md` includes at minimum:

```text
1. Inspect before editing.
2. Prefer existing patterns.
3. Make the smallest coherent change.
4. Do not perform unrelated refactoring.
5. Run relevant verification after changes.
6. Review the complete diff.
7. Never claim an unexecuted test passed.
8. Never ignore CI failures.
9. Fix root causes rather than symptoms.
10. Stop autonomous iteration when additional changes would be speculative.
```

---

# 17. Avoid Infinite Agent Loops

Loop Engineering does NOT mean looping indefinitely.

Stop when:

```text
acceptance criteria satisfied
AND
tests green
AND
static verification green
AND
build green
AND
relevant E2E green
AND
no actionable review finding
```

Also stop when there is a real external blocker such as:

* missing credentials
* unavailable external service
* ambiguous product requirement
* destructive migration requiring human approval
* production access requirement
* security-sensitive decision requiring approval

Report the blocker instead of guessing.

---

# 18. Human Approval Boundaries

Codex may autonomously:

* inspect files
* modify application code
* add tests
* run local tests
* run lint/type-check/build
* use Playwright locally
* inspect Sentry issues
* inspect GitHub CI failures

Require explicit human intent before destructive or production-facing operations such as:

* production database mutation
* deleting production resources
* publishing releases
* rotating secrets
* broad dependency upgrades
* force pushing shared branches

---

# 19. Recommended Architecture of the Development Loop

```text
                 ┌───────────────┐
                 │ GitHub Issue  │
                 └───────┬───────┘
                         │
                         ▼
                 ┌───────────────┐
                 │     Codex     │
                 └───────┬───────┘
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼

            Tests     Playwright   Static
                                  Analysis

              │          │          │
              └──────────┼──────────┘
                         ▼

                    Review Loop
                         │
                         ▼

                     GitHub CI
                         │
                 ┌───────┴───────┐
                 │               │
               FAIL             PASS
                 │               │
                 ▼               ▼
               Codex             PR
                 ▲
                 │
              Sentry
```

---

# 20. Desired Final Repository Setup

Inspect the current repository first and do not overwrite existing configuration unnecessarily.

Target structure should roughly resemble:

```text
studentory/
├── AGENTS.md
│
├── .agents/
│   └── skills/
│       ├── feature-loop/
│       ├── bugfix-loop/
│       ├── e2e-loop/
│       ├── review-loop/
│       └── ci-failure-loop/
│
├── .codex/
│   └── config.toml
│
├── .github/
│   ├── workflows/
│   └── dependabot.yml
│
├── docs/
│   ├── architecture.md
│   ├── development.md
│   ├── testing.md
│   └── decisions/
│
└── ...
```

This is a reference structure, not a requirement.

Do not create empty files or directories merely to match it.

---

# 21. Task for Codex

Now inspect the current Studentory repository.

Do NOT immediately modify files.

First:

1. inspect repository structure
2. inspect current `AGENTS.md`
3. inspect `.agents/skills`
4. inspect `.codex`
5. inspect `.github`
6. identify languages/frameworks
7. identify package/dependency managers
8. identify existing test framework
9. identify lint/type-check/format tools
10. identify build commands
11. identify existing Playwright setup
12. identify existing Sentry setup
13. identify existing GitHub Actions
14. identify missing pieces from this document

Then produce:

```text
Current State
Missing
Unnecessary
Recommended Changes
```

After that, implement only changes that materially improve the development feedback loop.

Priority:

```text
P0
- reliable build/test commands
- CI completion gate
- correct AGENTS.md
- core loop Skills

P1
- Playwright E2E feedback
- CI failure loop
- Sentry debugging loop
- dependency/security automation

P2
- documentation improvements
- optional external integrations
```

Avoid tooling for tooling's sake.

The final system should optimize:

```text
time from mistake
        ↓
feedback
        ↓
root cause
        ↓
verified fix
```

not the number of installed tools.

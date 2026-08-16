# AGENTS.md

## AGENTS.md Constraints

These constraints apply to every `AGENTS.md` file in this repository.

### File Size

- Every `AGENTS.md` must remain under 500 lines.
- Treat 500 lines as a hard limit, not a target.
- Prefer concise rules over detailed explanations.
- Do not duplicate instructions from parent `AGENTS.md` files.
- Move specialized instructions to the closest relevant subdirectory.
- Consolidate or remove redundant rules before adding new ones.
- Before adding a new rule, check whether an existing rule can be updated instead.

### Writing Style

- Use clear, concise, actionable language.
- Do not use emojis.
- Do not use decorative text or symbols.
- Do not use motivational or conversational filler.
- Do not repeat the same rule in multiple forms.
- Avoid unnecessary examples.
- Prefer short imperative statements.
- Preserve token efficiency without sacrificing clarity.

---

## Purpose

This repository is a monorepo containing a FastAPI backend and a React frontend.

The root agent acts as the repository orchestrator.

It must:

- determine the affected scope
- coordinate backend and frontend changes
- preserve cross-stack consistency
- delegate implementation details to subdirectory `AGENTS.md` files
- avoid unrelated changes

Repository structure:

```text
/
├── backend/
│   └── AGENTS.md
├── frontend/
│   └── AGENTS.md
└── AGENTS.md
```

---

## Instruction Hierarchy

Agents must follow repository instructions using the following hierarchy:

1. Root `AGENTS.md`
2. Closest subdirectory `AGENTS.md`
3. Existing code conventions

User instructions take precedence over repository conventions unless they conflict with higher-level system constraints.

When working inside:

- `backend/` → follow `backend/AGENTS.md`
- `frontend/` → follow `frontend/AGENTS.md`

Subdirectory instructions extend the rules in this file.

If repository instructions conflict, the more specific instruction takes precedence.

---

## Work Protocol

Before making changes:

1. Read the relevant `AGENTS.md` files.
2. Inspect the relevant existing implementation.
3. Determine the affected scope.
4. Identify API or data-contract changes.
5. Identify affected tests and API consumers.
6. Make the smallest coherent change.
7. Verify the result with available project tooling.

For cross-stack features, consider the flow:

```text
User
  ↓
React UI
  ↓
API Client
  ↓
HTTP API
  ↓
FastAPI Router
  ↓
Service / Use Case
  ↓
Repository / External System
  ↓
Database
```

---

## General Engineering Principles

### Prefer Simple Solutions

Do not introduce abstractions unless they solve an actual problem.

Avoid:

- unnecessary design patterns
- premature optimization
- unnecessary dependencies
- generic abstractions used only once
- large refactors unrelated to the requested task

Prefer readable and explicit code.

### Respect Existing Architecture

Before introducing a new pattern:

- inspect similar existing code
- reuse existing utilities
- follow existing naming conventions
- follow existing directory organization

Prefer consistency with the existing codebase over introducing an incompatible pattern.

### Keep Changes Scoped

Do not:

- rename unrelated files
- reformat unrelated code
- modify unrelated modules
- upgrade dependencies without a reason
- rewrite existing architecture unless explicitly requested

Every change must have a clear relationship to the requested task.

### Avoid Speculative Changes

- Do not implement requirements the user did not request.
- Do not prepare for hypothetical future features unless explicitly requested.
- Do not refactor working code solely for stylistic preference.
- Do not add abstractions solely for possible future reuse.

---

## Backend / Frontend Boundary

The backend owns:

- business rules
- authorization
- authoritative validation
- persistence
- external integrations
- server-side security

The frontend owns:

- presentation
- user interactions
- local UI state
- client-side navigation
- user-facing validation and feedback

Business rules must not exist only in the frontend.

Frontend validation improves UX, but backend validation remains authoritative.

---

## API Contract

The backend API is the contract between backend and frontend.

When modifying an API:

1. Check request schemas.
2. Check response schemas.
3. Check HTTP status codes.
4. Check known API consumers.
5. Update all affected consumers if the contract changes.

Do not change an existing API contract without checking all known consumers.

Avoid undocumented response shapes.

Prefer stable and explicit API contracts.

Conceptually:

```text
Backend Schema
      ↓
OpenAPI Contract
      ↓
Frontend API Type
      ↓
React Component
```

---

## Cross-Stack Changes

If a feature affects both backend and frontend, implement in this order when practical:

1. Define the data/API contract.
2. Implement backend behavior.
3. Verify backend behavior.
4. Implement frontend API integration.
5. Implement UI behavior.
6. Verify the complete flow.

Do not independently invent different representations of the same domain object on each side.

---

## Error Handling

Errors should be handled at the layer where they can be meaningfully interpreted.

Backend:

```text
Infrastructure Error
       ↓
Application Error
       ↓
HTTP Error
```

Frontend:

```text
HTTP Error
    ↓
API Client
    ↓
UI State
    ↓
User Feedback
```

Do not silently ignore failures.

Do not expose internal stack traces or sensitive server information to users.

---

## Security

Never commit:

- passwords
- API keys
- access tokens
- private keys
- production credentials
- secrets

Use environment variables for environment-specific configuration.

Common examples:

```text
.env
.env.local
.env.production
```

Environment files containing secrets must not be committed.

When adding configuration, update `.env.example` where appropriate.

---

## Dependency Management

Before adding a dependency, determine whether the existing stack already provides the required functionality.

New dependencies must:

- solve a concrete problem
- be actively maintained
- have a clear purpose
- not duplicate existing functionality unnecessarily

Backend dependencies belong to the backend dependency configuration.

Frontend dependencies belong to the frontend package configuration.

---

## Testing

Changes should preserve existing tests.

When modifying behavior:

- update affected tests
- add tests for important new behavior
- test error paths when relevant

Prefer testing behavior rather than implementation details.

Do not disable or remove tests only to make a change pass.

---

## Documentation

Update documentation when introducing:

- new environment variables
- new setup requirements
- new external services
- significant architectural changes
- new developer commands

Do not add documentation for self-explanatory implementation details.

---

## Completion Checklist

Before considering a task complete, verify:

- [ ] The requested behavior is implemented.
- [ ] Existing architecture was respected.
- [ ] Changes are limited to the required scope.
- [ ] No speculative features or refactors were introduced.
- [ ] Backend and frontend contracts match.
- [ ] Known API consumers were checked when contracts changed.
- [ ] Errors are handled appropriately.
- [ ] Types and schemas are consistent.
- [ ] Relevant tests pass.
- [ ] Linting and formatting rules are satisfied.
- [ ] No secrets or credentials were introduced.
- [ ] Documentation was updated if necessary.

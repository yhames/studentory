# Frontend AGENTS.md
## Scope
These instructions apply to the `frontend/` directory.

Follow the root `AGENTS.md` first. This file defines frontend-specific rules only.
## Role
Act as a senior frontend engineer responsible for the React application.

Prioritize:

- maintainable components
- predictable state
- explicit API boundaries
- type safety
- accessibility
- clear user feedback
- minimal, scoped changes
## Technology
Primary stack:

- React
- TypeScript

Use the framework, build tool, router, styling system, state libraries, and testing tools already configured in the repository.

Do not introduce new frontend frameworks or libraries without a concrete need.
## Frontend Work Protocol
Before modifying frontend code:

1. Read the root and frontend `AGENTS.md`.
2. Inspect nearby components and features before creating new patterns.
3. Identify affected pages, features, components, hooks, API clients, types, and tests.
4. Check the backend API contract before changing integration code.
5. Identify loading, empty, success, and error states when relevant.
6. Make the smallest coherent frontend change.
7. Run the relevant formatter, linter, type checker, build, and tests.
## Architecture
Respect the existing frontend structure.

Prefer feature-oriented organization when the application already uses it or when complexity justifies it.

Typical structure:
```text
frontend/
├── src/
│   ├── app/
│   ├── pages/
│   ├── features/
│   ├── components/
│   ├── hooks/
│   ├── api/
│   ├── types/
│   ├── utils/
│   └── assets/
├── tests/
└── AGENTS.md
```
Do not reorganize working code solely to match this example.
## Component Boundaries
Components should have a clear responsibility.

Separate concerns when a component owns too much of:

- data fetching
- complex state
- business decisions
- form handling
- presentation
- formatting


Do not extract trivial components only to reduce line count.

Keep domain-specific behavior out of generic shared UI components.
### Pages
Pages may own:

- route parameters
- page-level composition
- feature orchestration
### Features
Features may own:

- domain-specific user interactions
- feature state
- domain UI composition
- feature-level API coordination
### Shared Components
Shared components should remain reusable and domain-light.

Examples:
```text
Button
Input
Modal
Table
Spinner
```
## State Management
Use the smallest appropriate state mechanism.

Prefer:
```text
local state
    ↓
lifted state
    ↓
context
    ↓
external state management
```
Use local state for local UI concerns.

Use `useReducer` when state transitions are sufficiently complex.

Use Context for state genuinely shared across a subtree.

Use global state only when the data is truly application-wide or required by the existing architecture.

Do not introduce global state only to avoid ordinary prop passing.
## Server State vs UI State
Keep server state and UI state conceptually separate.

Server state examples:
```text
students
courses
attendance
assignments
```
UI state examples:
```text
dialog open
selected tab
search input
sidebar collapsed
```
Do not copy server responses into local state without a clear need.

Use the existing server-state library consistently when one is configured.

Avoid duplicate caches for the same server data.
## API Boundary
Centralize HTTP access through the project's API layer.

Preferred shape:
```text
src/
└── api/
    ├── client.ts
    ├── students.ts
    └── courses.ts
```
Do not scatter raw `fetch()` or `axios` calls across unrelated components when an API layer exists.

## API Contracts
Frontend types must match the backend contract.

When the backend contract changes:

1. Update request and response types.
2. Update API client functions.
3. Update affected consumers.
4. Update affected tests.
5. Verify status-code and error assumptions.

Do not invent fields that do not exist in the backend contract.

Do not silently reinterpret backend values without an explicit mapping layer.

Keep mappings centralized when representations intentionally differ.
## TypeScript
Prefer strict typing.

Avoid `any`.

Use `unknown` for genuinely unknown data and narrow it before use.

Prefer explicit types for:

- API boundaries
- public component props
- hooks
- domain models

Do not suppress TypeScript errors without understanding the cause.

Avoid unnecessary type assertions.

## Props
Keep component props focused.

Avoid passing large objects when a component only needs a small subset unless existing conventions prefer the full object.

Do not duplicate derived data in props when it can be computed clearly.

Use callback names that describe intent.

Examples:
```text
onSubmit
onSelectStudent
onClose
onDelete
```
## Hooks
Custom hooks should encapsulate reusable React behavior or feature logic.

Examples:
```text
useStudents
useStudent
useDebounce
usePagination
```
Follow the Rules of Hooks.

Do not use hooks as dumping grounds for unrelated behavior.

Do not hide significant side effects behind misleading hook names.
## Effects
Use `useEffect` to synchronize with external systems.

Appropriate examples:

- subscriptions
- timers
- browser APIs
- imperative third-party libraries

Do not use effects for values that can be derived during render.

Do not mirror props into state without a clear reason.

Clean up subscriptions, timers, and listeners.

Review dependency arrays instead of suppressing lint rules reflexively.
## Forms
Form state should have one clear owner.

Handle when relevant:

- validation
- submission state
- server errors
- disabled state
- duplicate submission prevention
- reset behavior

Frontend validation improves UX.

Backend validation remains authoritative.

Do not assume disabled UI controls provide security.
## Async UX
Represent user-visible asynchronous states explicitly when relevant:
```text
idle
loading
success
empty
error
```
Avoid interfaces that appear frozen during network operations.

Prevent duplicate submissions for non-idempotent operations.

Use optimistic updates only when rollback and failure behavior are clear.

Do not leave stale loading states after failures.
## Error Handling
Convert API failures into meaningful UI feedback.

Do not expose raw stack traces or server internals.

Do not silently swallow errors.

Use the project's existing error presentation pattern.

## Accessibility
Use semantic HTML and native interactive elements.

Prefer:
```html
<button>
<nav>
<main>
<form>
<label>
```
Interactive elements must be keyboard accessible.

Form controls should have accessible labels.

Images should use appropriate `alt` text.

Do not rely only on color to communicate important state.

Preserve focus behavior for dialogs and overlays when supported by the UI library.
## Styling
Use the styling system already configured in the project.

Do not introduce another styling system without a concrete need.

Prefer reusable styles or components for repeated visual patterns.

Avoid large inline style objects unless existing conventions use them intentionally.
## Performance
Do not optimize prematurely.

Use `useMemo`, `useCallback`, and `memo` only when they solve an actual problem.

Focus first on:

- correct state ownership
- avoiding duplicate network requests
- avoiding unnecessary global state
- efficient list rendering
- sensible component boundaries

## Routing
Use the router already configured in the project.

Keep route definitions centralized according to existing conventions.

Do not hardcode navigation logic in unrelated low-level components.

Validate and normalize route parameters before relying on them.

Handle invalid and not-found routes when relevant.
## Security
Do not place secrets in frontend code.

Do not expose private API keys through browser-visible environment variables.

Do not implement authorization only by hiding UI elements.

Avoid rendering untrusted HTML.

If raw HTML is required, sanitize it using the project's approved approach.

Treat all browser-controlled values as untrusted by the backend.
## Testing
Use the testing tools already configured in the repository.

Test user-visible behavior.

Prioritize tests for:

- critical user flows
- forms
- API-driven states
- loading states
- empty states
- error states
- accessibility-sensitive interactions
- regressions

Prefer accessible roles and labels when using DOM testing libraries.

Avoid tests tightly coupled to component internals.

Mock API boundaries rather than the behavior being tested.

Do not remove or weaken tests solely to make a change pass.
## Code Quality
Use only tools configured by the repository.

Typical checks may include:
```text
formatter
eslint
tsc
tests
build
```
Run the smallest relevant verification set first.

Run broader checks when shared types, API clients, routing, or common components change.

Do not claim a check passed unless it was actually run.

If a check cannot run, state the reason.
## Frontend Completion Checklist
- [ ] The requested frontend behavior is implemented.
- [ ] The change follows the root `AGENTS.md`.
- [ ] Components have clear responsibilities.
- [ ] State is stored at the appropriate level.
- [ ] API access follows the existing API boundary.
- [ ] Frontend types match backend contracts.
- [ ] Loading, empty, and error states are handled when relevant.
- [ ] Forms prevent accidental duplicate submission when relevant.
- [ ] Accessibility was considered.
- [ ] Unsafe types and assertions were avoided.
- [ ] Relevant tests were added or updated.
- [ ] Relevant quality checks were run.
- [ ] No unrelated refactor was introduced.

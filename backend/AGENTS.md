# Backend AGENTS.md

## Scope

These instructions apply to the `backend/` directory.

Follow the root `AGENTS.md` first. This file defines backend-specific rules only.

---

## Role

Act as a senior backend engineer responsible for the FastAPI application.

Prioritize:

- correctness
- maintainability
- explicit API contracts
- clear layer boundaries
- predictable error handling
- testability
- minimal, scoped changes

---

## Technology

Primary stack:

- Python
- FastAPI
- Pydantic
- SQLAlchemy or SQLModel when persistence is required
- Alembic when database migrations are required
- pytest when testing is configured

Use the versions, package manager, and tools already configured in the repository.

Do not introduce alternative frameworks or libraries without a concrete need.

---

## Backend Work Protocol

Before modifying backend code:

1. Read the root and backend `AGENTS.md`.
2. Inspect nearby implementations before creating new patterns.
3. Identify affected routers, schemas, services, repositories, models, and tests.
4. Check whether the change affects the public API contract.
5. Check known frontend or external API consumers when the contract changes.
6. Make the smallest coherent backend change.
7. Run the relevant formatter, linter, type checker, and tests.

---

## Architecture

Respect the existing directory structure.

When the repository uses layered architecture, keep responsibilities separated:

```text
HTTP Request
    ↓
Router
    ↓
Service / Use Case
    ↓
Repository / Integration
    ↓
Database / External System
```

Typical structure:

```text
backend/
├── app/
│   ├── main.py
│   ├── api/
│   ├── schemas/
│   ├── services/
│   ├── repositories/
│   ├── models/
│   ├── core/
│   └── db/
├── tests/
└── AGENTS.md
```

Do not reorganize working code solely to match this example.

---

## Layer Boundaries

### Routers

Routers own HTTP concerns.

They may:

- parse requests
- validate request parameters
- inject dependencies
- call services or use cases
- map application results to HTTP responses
- select HTTP status codes

They must not contain substantial business logic or persistence logic.

Prefer thin routers.

### Services / Use Cases

Services own application behavior and business rules.

They may:

- coordinate repositories
- enforce business rules
- control transactions
- call external integrations
- raise application-level exceptions

Avoid coupling service logic to FastAPI request or response objects.

### Repositories

Repositories own persistence access when the project uses a repository layer.

They may:

- execute queries
- create, update, and delete persisted entities
- map persistence-specific failures when appropriate

Do not spread equivalent database queries across unrelated routers and services.

Do not create repository abstractions when the existing codebase does not need them.

### Models

Database models represent persistence.

Do not treat persistence models as API contracts by default.

### Schemas

Pydantic schemas represent input, output, validation, or application data contracts.

Use separate schemas when create, update, and response responsibilities differ.

---

## API Design

Prefer explicit and stable contracts.

For each endpoint, define intentionally:

- path
- HTTP method
- request schema
- response schema
- status code
- error behavior

Prefer resource-oriented routes:

```text
GET    /students
GET    /students/{student_id}
POST   /students
PATCH  /students/{student_id}
DELETE /students/{student_id}
```

Use action routes only for domain commands that do not map cleanly to CRUD.

Do not return undocumented response shapes.

Do not change an existing API contract without checking known consumers.

---

## Pydantic

Use Pydantic models for explicit data contracts.

Prefer:

```python
class StudentCreate(BaseModel):
    name: str
    grade: int


class StudentUpdate(BaseModel):
    name: str | None = None
    grade: int | None = None


class StudentResponse(BaseModel):
    id: int
    name: str
    grade: int
```

Avoid exposing database models directly unless the project intentionally uses that pattern.

Keep validation close to the boundary that owns it.

Do not duplicate the same business rule across multiple schemas and services without a reason.

---

## Type Hints

Use type hints consistently.

Prefer modern Python syntax when supported by the configured Python version:

```python
str | None
list[Student]
dict[str, int]
```

Avoid untyped public functions when practical.

Avoid unnecessary `Any`.

Use precise return types for services, repositories, and public helpers.

---

## Async Rules

Use `async def` for asynchronous I/O.

Examples:

- async database operations
- HTTP calls
- network I/O
- async SDK calls

Do not use `async` only because FastAPI supports it.

Do not execute blocking I/O inside the event loop when an async alternative is expected.

Do not mix sync and async database patterns without understanding the configured session model.

---

## Dependency Injection

Use FastAPI dependency injection for request-scoped or infrastructure dependencies such as:

- database sessions
- authentication
- authorization context
- configuration
- service construction

Do not use dependency injection for pure utilities that do not need request or infrastructure context.

Keep dependency construction predictable and easy to test.

---

## Error Handling

Prefer application-specific exceptions for expected application failures.

Map them to HTTP errors at the API boundary or through centralized exception handlers.

Preferred flow:

```text
Database / External Error
          ↓
Application Error
          ↓
HTTP Response
```

Do not scatter `HTTPException` through service and repository layers unless the existing architecture intentionally does so.

Do not expose:

- stack traces
- database details
- internal hostnames
- secrets
- raw external-service errors containing sensitive data

Use consistent error response shapes when the project defines one.

---

## Database

Keep persistence concerns separate from API schemas.

When changing database structure:

1. Update the model.
2. Create an Alembic migration when Alembic is configured.
3. Review generated migration code.
4. Verify upgrade behavior.
5. Verify downgrade behavior when supported.
6. Update affected tests.

Do not rely on automatic table creation as a replacement for migrations in a migration-managed project.

Do not modify production schema expectations without a corresponding migration.

---

## Transactions

A transaction should represent one logical application operation.

Prefer transaction boundaries at the service or use-case layer when multiple persistence operations belong together.

Avoid independent commits inside repository methods when they prevent atomic application operations.

Follow the transaction pattern already established by the project.

---

## Configuration

Centralize application configuration.

Prefer typed settings when the project uses them.

Use environment variables for environment-specific values.

Do not scatter `os.getenv()` across unrelated modules when a settings abstraction exists.

When adding configuration:

- update the settings model
- update `.env.example` when appropriate
- document required values when setup changes

Never provide production secrets as defaults.

---

## External Integrations

Wrap external systems behind a clear integration boundary when complexity justifies it.

Examples:

- HTTP APIs
- message brokers
- robot SDKs
- cloud services
- file storage

Keep vendor-specific behavior out of routers when possible.

Define timeout and failure behavior for network calls.

Do not retry non-idempotent operations blindly.

Do not log credentials or full sensitive payloads.

---

## Logging

Use the configured logging framework.

Prefer meaningful context over verbose messages.

Do not use `print()` as application logging.

Do not log:

- passwords
- tokens
- authorization headers
- private keys
- secrets
- unnecessary personal data

Avoid duplicate logging of the same exception at multiple layers.

---

## Security

Backend validation is authoritative.

Validate and authorize every protected operation on the server.

Do not trust:

- frontend validation
- client-provided roles
- hidden UI state
- client-calculated privileged values

Use parameterized ORM or database operations.

Do not construct unsafe SQL from untrusted input.

Apply least privilege to credentials and integrations.

---

## Testing

Use the testing tools already configured in the repository.

Test behavior, not implementation details.

Prioritize tests for:

- business rules
- API contracts
- validation
- authorization
- error paths
- transaction behavior
- important repository queries
- external integration boundaries

When fixing a bug, add a regression test when practical.

Mock external boundaries rather than the behavior being tested.

Do not remove or weaken tests solely to make a change pass.

---

## Code Quality

Use only tools configured by the repository.

Typical tools may include:

```text
ruff
pyright
mypy
pytest
```

Before finishing, run the smallest relevant verification set first.

Run broader checks when the change affects shared or cross-cutting code.

Do not claim a check passed unless it was actually run.

If a check cannot run, state the reason.

---

## Backend Completion Checklist

- [ ] The requested backend behavior is implemented.
- [ ] The change follows the root `AGENTS.md`.
- [ ] Layer responsibilities remain clear.
- [ ] Routers remain thin.
- [ ] API schemas and status codes are explicit.
- [ ] Known API consumers were checked when contracts changed.
- [ ] Business rules remain server-authoritative.
- [ ] Database changes include migrations when required.
- [ ] Transaction boundaries are correct.
- [ ] Errors do not expose internal details.
- [ ] Types are consistent.
- [ ] Relevant tests were added or updated.
- [ ] Relevant quality checks were run.
- [ ] No unrelated refactor was introduced.

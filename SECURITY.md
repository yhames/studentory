# Security Policy

## Supported Versions

Only the latest commit on the `main` branch is supported for security fixes.
Historical commits, unmerged branches, and forks are not maintained by this
repository.

## Reporting a Vulnerability

Do not report suspected vulnerabilities through a public GitHub Issue.

Use GitHub Private Security Advisories:

https://github.com/yhames/studentory/security/advisories/new

Include:

- the affected component and commit;
- reproduction conditions;
- realistic security impact;
- sanitized logs or proof of concept when necessary.

Do not include credentials, personal information, real student records, or
unnecessary exploit details.

## System and Scope

This repository publishes Studentory source code. The repository owner does
not operate a public Studentory service or production database from this
repository.

Security review covers:

- the FastAPI backend;
- the React frontend;
- API and data contracts;
- dependency and build configuration;
- GitHub Actions and repository automation.

## Threat Model and Trust Boundaries

Treat API requests, browser input, imported data, environment variables,
dependency artifacts, and pull-request content as untrusted.

Important assets include source integrity, credentials supplied by deployers,
application data handled by independently deployed instances, and the CI
supply chain.

## Security Invariants

- Secrets and personal data must not be committed.
- Backend validation remains authoritative.
- Sensitive operations must not rely only on frontend controls.
- Error responses and logs must not expose credentials, personal data, stack
  traces, or internal infrastructure details.
- Browser-controlled values must be treated as untrusted by the backend.
- CI and dependency updates must pass the required repository checks.
- Sentry must remain disabled unless a deployer explicitly supplies a DSN.

## Reportable Findings

A finding is reportable when it affects the latest `main` branch and has a
realistic path to compromising confidentiality, integrity, availability,
source integrity, credentials, or data processed by a deployed instance.

Relevant findings include exploitable API behavior, unsafe browser rendering,
secret exposure, dependency or CI supply-chain compromise, and bypasses of
server-side validation.

## Out of Scope and Known Limitations

This repository does not define or operate production hosting, networking,
identity, backup, or database infrastructure. Deployment-specific findings
should be reported to the operator of the affected deployment.

No additional accepted security risks or finding-class exclusions are
currently documented.

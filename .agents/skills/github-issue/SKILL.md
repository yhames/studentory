---
name: github-issue
description: Inspect, create, update, or triage Studentory GitHub Issues from the Roadmap and product specifications. Use for Issue-backed work selection or Issue management; do not use for implementing the issue or managing pull requests.
---

# Manage Studentory GitHub Issues

Use `docs/ROADMAP.md` as the implementation-order source and GitHub Issues as executable work records. Read `PRODUCT_SPEC.md`, the relevant specification, and the applicable `AGENTS.md` files before proposing issue content.

Determine the requested mode:

- **Recommend**: inspect live Issues and local sources, then recommend one actionable item without changing GitHub.
- **Create**: search for duplicates, preview a complete issue, create it when the request authorizes creation, then read it back.
- **Update**: change only the requested fields on an identified issue, then read it back.
- **Triage**: classify existing issues and recommend labels, priority, blockers, or order. Do not apply changes unless requested.

For every mode:

1. Inspect the live repository rather than relying on remembered Issue state.
2. Search open and closed Issues by Roadmap ID and normalized title before creation.
3. Classify the issue as Feature, Bug, or Decision and use the matching Issue Form fields.
4. Keep one independently verifiable outcome per issue. Split unrelated outcomes instead of creating a broad issue.
5. Derive acceptance criteria from confirmed sources and current implementation. Do not copy already-satisfied criteria as unfinished work.
6. Link blockers and decisions explicitly. A Feature blocked by an unresolved product rule remains blocked.
7. Reuse existing labels and exact repository vocabulary. Do not infer assignees, milestones, or priority without evidence.
8. Never place secrets, personal data, private vulnerability details, or unsanitized logs in a public issue. Route vulnerabilities to a private security advisory.

After a mutation, read back the issue and report its number, title, URL, labels, assignees, state, and unresolved blockers. GitHub authentication or write failure means the mutation is incomplete.

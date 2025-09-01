# llms.md — How to work with this repo (for AI assistants)

This document teaches AI assistants how to contribute safely and effectively to this TypeScript + GraphQL project.

---

## Sources of truth

- **PRD**: ./docs/PRD.md
- **Data Model**: ./docs/data-model.md
- **GraphQL Schema (generated)**: ./schema.graphql  ← generated from the database via PostGraphile
- **Contributing rules**: ./CONTRIBUTING.md
- **README**: ./README.md

> Always treat the PRD, data model, and generated GraphQL schema as authoritative.

---

## Tech stack & conventions

- Language: **TypeScript** (strict)
- Tests: **Vitest**
- Lint/format: **ESLint** (+ Prettier via ESLint if configured)
- GraphQL: **PostGraphile** (schema generated from DB)
- Package manager: **Yarn**
- CI: **GitHub Actions**

Project layout (typical):

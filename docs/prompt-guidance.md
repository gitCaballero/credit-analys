# Prompt Guidance and Relevant Instructions

This document captures the most relevant project prompts and the instructions that guided the implementation.

## Key prompts processed

### 1. `api-rest.md`
- Defined REST API endpoints, request/response DTOs, HTTP statuses, validation, and error handling.
- Important for frontend contract design.

### 2. `data-persistent.md`
- Defined relational persistence strategy and audit/history tables.
- Important for database design and event outbox.

### 3. `documentation.md`
- Required a senior engineering README with architecture, scope, rules, modules, events, and execution.
- Important for project onboarding and senior review.

### 4. `domain-model.md`
- Required domain entities, value objects, enums, aggregates, invariants.
- Important for clean DDD design and domain correctness.

### 5. `eligibility-rules-engine.md`
- Required deterministic eligibility policies, structured results, versioning, and tests.
- Important for separating rules from application flow.

### 6. `events-driven.md`
- Required event naming, payloads, outbox pattern, idempotence, retry, and consumers.
- Important for auditability and future integration.

### 7. `ia-opcional.md`
- Defined permitted AI support use cases and strict guardrails.
- Important to keep AI advisory only and not decision-making.

### 8. `incrementing-implementation.md`
- Required phase-based delivery and staged implementation.
- Important for deciding scope and incremental progress.

### 9. `mermaid-diagram.md`
- Required architecture, sequence, state, and eligibility flow diagrams.
- Important for visualizing the design.

### 10. `proyect-sctruct.md`
- Required project folder structure and module responsibilities.
- Important for project organization.

### 11. `refatoring.md`
- Required code quality, separation of concerns, naming, and auditability.
- Important for maintaining clean architecture.

### 12. `security.md`
- Required security strategy for sensitive data, encryption, masking, validation, and guards.
- Important for production-readiness.

### 13. `test.md`
- Required testing strategy, scenario matrix, and Jest examples.
- Important for quality assurance.

### 14. `use-case.md`
- Required application use case definitions, inputs, outputs, and ports.
- Important for clean use-case implementation.

## How these prompts were used

- Prompts were translated into code, docs, and tests when relevant.
- `api-rest.md` and `documentation.md` became README API docs.
- `domain-model.md` guided the domain entities and validation rules.
- `events-driven.md` guided the outbox and event design.
- `security.md` informed log masking and sensitive field treatment.
- `test.md` informed test scenarios and coverage.

## Relevant instructions to keep in mind

- Do not expose sensitive data.
- Keep architecture clean and decoupled from NestJS in the domain layer.
- Prefer event-driven, auditable processes.
- Keep prompt outputs stored in repo docs.
- Use tokens efficiently by summarizing instead of repeating.

## Recommended usage

- Consult `docs/prompt-guidance.md` before starting a new feature.
- Use it as a checklist to verify prompt coverage.
- If a prompt is already implemented in code or docs, reference its file rather than rewriting.

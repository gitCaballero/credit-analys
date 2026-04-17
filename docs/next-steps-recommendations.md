# Recomendações de Próximos Passos

Este documento consolida os próximos passos mais valiosos para fortalecer a aplicação após a fase atual de MVP.

## Resumo executivo

A aplicação já cobre o fluxo principal de negócio:

- recebimento da proposta
- validação de elegibilidade da oferta
- validação de elegibilidade dos benefícios
- criação da conta do cartão
- ativação de benefícios
- consulta de status pelo cliente
- trilha de auditoria
- persistência de outbox
- assistente com OpenAI e fallback local

Os próximos avanços devem focar em tornar a solução mais pronta para produção, mais segura, mais resiliente e mais fácil de evoluir.

## Recommended priorities

### Priority 1: Production reliability

- Introduce transactional consistency between proposal persistence and outbox persistence.
- Implement an outbox processor that reads pending events, publishes them, retries transient failures, and marks processed records.
- Add idempotency for critical commands such as proposal creation, submit, card creation, and benefit activation.
- Standardize structured error responses across all endpoints.
- Add observability for failures, retries, and state transitions.

Expected impact:

- fewer inconsistent states
- safer integrations
- better supportability

### Priority 2: Security and sensitive data protection

- Mask or encrypt sensitive fields such as `nationalId` and `email` at rest if this moves beyond demo scope.
- Add request logging with PII masking.
- Introduce authentication and authorization for proposal and assistant endpoints.
- Add correlation IDs and request IDs to all API calls and emitted events.
- Review what fields are included in audit logs and AI prompts to ensure no unnecessary sensitive data is exposed.

Expected impact:

- better compliance posture
- safer operations
- lower leakage risk

### Priority 3: Conversational assistant maturity

- Persist assistant conversation context by session or proposal, instead of relying only on request payload reuse.
- Separate conversational state from business state so the assistant can resume flows more naturally.
- Add stronger intent routing and parameter extraction for the OpenAI path.
- Consider structured tool calling or stronger output schemas for model responses.
- Expand fallback coverage for more recovery paths and ambiguous user prompts.

Expected impact:

- more natural guided journeys
- fewer repeated questions
- less brittle AI behavior

### Priority 4: Domain and lifecycle hardening

- Make lifecycle transitions explicit and centralized to prevent invalid state changes.
- Introduce domain-specific exceptions instead of generic `Error`.
- Clarify terminal vs recoverable states for card creation and benefit activation.
- Define whether partial benefit activation is acceptable or should trigger compensation/retry.
- Keep `status` as the canonical lifecycle and document any companion operational states clearly.

Expected impact:

- clearer domain rules
- easier debugging
- less accidental regression

### Priority 5: Test and quality expansion

- Add API-level integration tests for the main happy path and rejection paths.
- Add persistence tests for TypeORM repositories and entity mapping.
- Add outbox persistence and processing tests.
- Add tests for invalid transitions and retry/idempotency behavior.
- Expand assistant tests to cover more tool branches and error recovery.

Expected impact:

- better regression protection
- more confidence during refactors
- safer future feature work

## Architecture recommendations

## 1. Make proposal save plus outbox save atomic

Today the application persists proposal changes and outbox events as separate calls. In production, those should be part of the same database transaction.

Recommendation:

- use a transaction per use case mutation
- save proposal aggregate and outbox event in the same unit of work
- roll back both if one fails

Why this matters:

- prevents proposal updates without matching integration events
- prevents events from being published for changes that were never committed

## 2. Add a dedicated outbox processor

The current outbox implementation stores events correctly, but there is not yet a worker that consumes and processes them.

Recommendation:

- add a scheduled worker or background process
- fetch `pending` outbox records in batches
- publish them to logs, webhooks, queue, or broker
- mark them as `processed`
- add retry counts and dead-letter handling for repeated failures

Minimum processing states:

- `pending`
- `processing`
- `processed`
- `failed`

## 3. Add command idempotency

The following operations are especially sensitive to retries or duplicate requests:

- create proposal
- submit proposal
- create card account
- activate benefits

Recommendation:

- use idempotency keys or deduplication rules
- persist request identifiers
- return the previous result when the same request is replayed safely

## 4. Move to explicit domain exceptions

Current business failures are mostly represented with generic `Error`, later mapped to HTTP exceptions.

Recommendation:

- create explicit exceptions such as `ProposalNotFoundError`, `InvalidProposalTransitionError`, `OfferNotEligibleError`, and `BenefitNotEligibleError`
- map these centrally in an exception layer

Why this helps:

- cleaner code
- clearer contracts
- easier testing

## Security recommendations

## 1. Protect sensitive data

Current code stores personal data directly in the proposal table.

Recommendation:

- encrypt sensitive fields if production use is expected
- mask them in logs and support tools
- avoid sending raw PII to the AI layer when not strictly necessary

## 2. Add API protection

Recommendation:

- authenticate all proposal and assistant endpoints
- authorize access per customer or operator profile
- rate-limit the assistant endpoint

## 3. Improve audit quality

Recommendation:

- include actor identity when available
- include correlation IDs for traceability
- avoid recording unnecessary personal data in audit messages

## Assistant recommendations

## 1. Persist conversational memory

The assistant currently works well for guided interactions, but still depends heavily on the caller resending `proposalId` and structured parameters.

Recommendation:

- create a conversation/session store
- persist current intent, missing fields, and last successful tool action
- allow the assistant to resume an interrupted application flow

## 2. Strengthen model integration

Recommendation:

- use structured tool invocation or validated JSON schemas for model output
- reject malformed tool payloads with safe fallbacks
- log model parsing failures separately from business failures

## 3. Keep fallback behavior as a first-class path

The fallback is a strength of this project and should remain intentional.

Recommendation:

- document fallback-supported journeys
- test fallback behavior independently
- keep fallback deterministic for regulated or auditable flows

## Data and persistence recommendations

## 1. Evolve audit and history storage

Embedding `auditEntries` in the proposal row is acceptable for MVP simplicity, but may become limiting.

Recommendation:

- keep embedded JSON for quick reads if needed
- consider a dedicated audit/history table for larger scale or stricter reporting needs

## 2. Introduce migrations

Current development setup relies on schema synchronization.

Recommendation:

- replace automatic schema sync with explicit database migrations before production

Why this matters:

- safer schema evolution
- reproducible deployments
- easier rollback and review

## 3. Separate read and write concerns when needed

As the flow grows, the application may benefit from clearer query models for customer status and operator views.

Recommendation:

- keep command-side aggregates focused on invariants
- introduce lightweight read models for status and journey visualization if necessary

## Testing recommendations

## 1. Expand integration coverage

Recommended scenarios:

- full happy path from proposal creation to completed activation
- selected offer rejected even when another offer is eligible
- invalid benefit for selected offer
- card creation failure
- partial benefit activation
- duplicate submit or duplicate card creation request
- outbox processing retry and failure

## 2. Add repository tests

Recommendation:

- verify mapping of audit entries
- verify mapping of benefit activation status
- verify proposal reload consistency after lifecycle updates

## 3. Add assistant-specific tests

Recommendation:

- cover every supported tool branch
- test fallback guided prompts
- test malformed model output
- test conversation recovery once session persistence exists

## Operational recommendations

## 1. Add observability

Recommendation:

- structured logs
- correlation IDs
- metrics for proposal states
- metrics for assistant usage
- metrics for outbox backlog and failures

Useful dashboards:

- proposal creation rate
- rejection reasons
- card creation success rate
- benefit activation failure rate
- outbox pending volume
- assistant fallback vs OpenAI usage

## 2. Add environment hardening

Recommendation:

- validate required environment variables at startup
- separate dev, test, and production configs
- protect secrets with proper secret management

## Suggested implementation roadmap

### Phase 1

- add explicit domain exceptions
- improve API error contract
- add more integration tests
- document assistant and fallback limitations

### Phase 2

- add transactional proposal plus outbox writes
- implement outbox processor
- add correlation IDs and structured logging

### Phase 3

- add authentication and authorization
- add PII masking and encryption strategy
- replace schema sync with migrations

### Phase 4

- persist assistant session memory
- add stronger OpenAI structured tool handling
- improve conversation recovery and multi-turn flows

## Final recommendation

The strongest next move is to treat the current system as a solid MVP foundation and evolve it in this order:

1. reliability and transaction safety
2. security and sensitive data protection
3. assistant memory and robustness
4. event processing maturity
5. broader integration testing

That sequence preserves delivery momentum while reducing the highest architectural and operational risks first.

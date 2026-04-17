# Briefing para asistentes de código

Este documento es una guía compacta para que un asistente de programación comprenda rápidamente el dominio, los flujos y los archivos más relevantes.

## Dominio y reglas de negocio

- Existe un flujo de solicitud de tarjeta de crédito con estados auditables.
- Ofertas de tarjeta:
  - `A`: renta > 1000
  - `B`: renta > 15000 e inversiones > 5000
  - `C`: renta > 50000 y cuenta corriente > 2 años
- Beneficios:
  - `CASHBACK` y `POINTS` son mutuamente excluyentes.
  - `TRAVEL_INSURANCE` solo disponible con oferta `C`.
  - `VIP_LOUNGE` solo disponible con ofertas `B` o `C`.

## Flujo principal

1. Crear propuesta (`POST /proposals`).
2. Validar elegibilidad de oferta (`POST /proposals/:proposalId/offer-validation`).
3. Validar selección de beneficios (`POST /proposals/:proposalId/benefits-validation`).
4. Enviar propuesta (`POST /proposals/:proposalId/submit`).
5. Crear cuenta de tarjeta (`POST /proposals/:proposalId/card-creation`).
6. Activar beneficios (`POST /proposals/:proposalId/benefits-activation`).
7. Consultar estado consolidado (`GET /proposals/:proposalId/status`).
8. Obtener explicación de la propuesta (`GET /proposals/:proposalId/explanation`).

## Servicios y límites técnicos

- `src/interfaces/http` es la capa de entrada REST.
- `src/application/use-cases` orquesta la lógica y publica eventos.
- `src/domain` contiene reglas y políticas de elegibilidad.
- `src/infrastructure` contiene adaptadores, repositorios y entidades de persistencia.
- `src/interfaces/cli/assistant-cli.ts` es el asistente de línea de comandos.

## Archivos prioritarios para revisión rápida

- `README.md`
- `docs/context-memory-strategy.md`
- `docs/repo-structure.md`
- `src/app.module.ts`
- `src/main.ts`
- `src/interfaces/http/proposal.module.ts`
- `src/interfaces/http/controllers/proposal.controller.ts`
- `src/interfaces/http/services/proposal.service.ts`
- `src/application/use-cases/create-proposal.use-case.ts`
- `src/application/use-cases/validate-offer-eligibility.use-case.ts`
- `src/application/use-cases/validate-benefits.use-case.ts`
- `src/domain/policies/offer-eligibility.policy.ts`
- `src/domain/policies/benefit-eligibility.policy.ts`
- `src/infrastructure/typeorm/entities/proposal.entity.ts`

## Memoria de contexto útil

- Evitar asumir que el asistente es el decisor: las reglas de elegibilidad son determinísticas.
- El dominio es el dueño de las reglas, no el adaptador HTTP ni el asistente conversacional.
- Mantener las categorías de estado separadas:
  - `ProposalStatus`
  - `CardCreationStatus`
  - `BenefitActivationStatus`
- Confirmar que cualquier refactor mantenga auditabilidad e idempotencia.

## Nota para asistentes futuros

Si una tarea requiere refactor de estructura, primero actualiza solo los límites de carpeta y rutas de importación. Luego valida con `npm run build` y pruebas específicas.

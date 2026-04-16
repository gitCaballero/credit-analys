Genera el diseño event-driven para esta solución.

Necesito:
- lista de eventos de dominio y de integración
- payload sugerido para cada evento
- naming convention
- versión de eventos
- recomendaciones de idempotencia
- estrategia de retry y dead-letter queue
- correlación de eventos por proposalId y correlationId

Eventos sugeridos como punto de partida:
- proposal.received
- proposal.validated
- offer.eligibility.calculated
- benefits.selection.validated
- proposal.submitted
- card.creation.requested
- card.created
- card.creation.failed
- benefits.activation.requested
- benefits.activated
- benefits.activation.failed
- proposal.completed
- proposal.rejected
- customer.notified

Quiero además:
- ejemplo de publisher y consumer en NestJS
- patrón outbox sugerido
- cómo evitar doble creación de cuenta tarjeta o doble activación de beneficios
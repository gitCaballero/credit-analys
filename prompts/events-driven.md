Gere o design event-driven para esta solução.

Preciso de:
- lista de eventos de domínio e de integração
- payload sugerido para cada evento
- convenção de nomenclatura
- versão de eventos
- recomendações de idempotência
- estratégia de retry e dead-letter queue
- correlação de eventos por proposalId e correlationId

Eventos sugeridos como ponto de partida:
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

Quero também:
- exemplo de publisher e consumer em NestJS
- padrão outbox sugerido
- como evitar dupla criação da conta de cartão ou dupla ativação de benefícios
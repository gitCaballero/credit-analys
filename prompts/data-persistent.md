Desenhe a persistência de dados para esta solução usando PostgreSQL.

Preciso de:
- modelo relacional inicial
- tabelas principais
- chaves primárias e estrangeiras
- índices
- campos de auditoria
- estratégia para histórico de estados
- estratégia para event outbox
- estratégia para dados sensíveis

Tabelas esperadas como mínimo:
- proposals
- proposal_status_history
- selected_benefits
- activated_benefits
- audit_entries
- outbox_events

Quero que defina:
- colunas
- tipos sugeridos
- restrições
- quais dados devem ser criptografados ou mascarados
- como modelar versões de regras aplicadas
- como modelar erros técnicos vs erros de negócio

Entrega:
- SQL inicial ou entidades para ORM
- explicação de design
- decisões de normalização
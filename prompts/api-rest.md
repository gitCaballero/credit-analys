Gere a especificação da API REST para o sistema de solicitação de cartão de crédito.

Endpoints mínimos:
- POST /proposals
- POST /proposals/{proposalId}/offer-validation
- GET /proposals/{proposalId}/eligible-benefits
- POST /proposals/{proposalId}/benefits-validation
- POST /proposals/{proposalId}/submit
- GET /proposals/{proposalId}/status

Quero:
- DTOs de request/response
- códigos HTTP corretos
- exemplos JSON
- validações
- erros esperados
- contrato consistente e fácil de consumir pelo frontend

Restrições:
- Não expor informações sensíveis desnecessárias
- Mascarar dados delicados em respostas e logs
- Incluir correlationId e requestId
- Respostas pensadas para uma UI que precisa mostrar:
  - status da proposta
  - cartão criado ou não
  - benefícios ativados
  - mensagens de negócio compreensíveis

Se achar melhor, você pode adicionar endpoints adicionais, mas justifique cada um.
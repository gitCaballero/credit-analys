Gere a estratégia de segurança para o sistema de solicitação de cartão de crédito.

Preciso de recomendações e exemplos de implementação para:
- proteção de dados sensíveis
- criptografia em trânsito e em repouso
- mascaramento em logs
- controle de acesso
- gerenciamento de segredos
- validação de entrada
- proteção contra replay ou duplicação
- idempotência
- rastreabilidade e auditoria
- separação entre dados de negócio e dados sensíveis

Contexto:
- O sistema processa dados pessoais e financeiros
- Deve ser auditável
- Deve evitar exposição desnecessária de PII
- A conta corrente já existe, mas o sistema cria a conta do cartão
- Deve haver logs úteis sem filtrar informações sensíveis

Quero:
- diretrizes de arquitetura
- middleware/guards/interceptors sugeridos em NestJS
- utilitários para mascarar dados
- estratégia de classificação de dados
- checklist de segurança para produção
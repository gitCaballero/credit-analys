Quero que você atue como um Software Architect sênior especializado em originação de cartões de crédito, onboarding digital, regras de elegibilidade e sistemas event-driven.

Desenhe e gere uma solução backend em Node.js + TypeScript para um fluxo de solicitação de cartão de crédito onde o cliente pode escolher benefícios durante a jornada.

Contexto de negócio:
- Existem 3 ofertas de cartão:
  - Oferta A: renda > 1000
  - Oferta B: renda > 15000 e investimentos > 5000
  - Oferta C: renda > 50000 e conta corrente com mais de 2 anos
- Benefícios:
  - Cashback: incompatível com Pontos
  - Pontos: incompatível com Cashback
  - Seguro de viagem: apenas para oferta C
  - Sala VIP: apenas para ofertas B e C
- No final, o cliente deve visualizar:
  - estado da proposta
  - se a conta do cartão foi criada ou não
  - quais benefícios foram ativados

Requisitos funcionais mínimos:
- Receber proposta com dados pessoais, tipo de oferta e seleção de benefícios
- Validar elegibilidade de oferta e benefícios
- Criar conta do cartão
- Ativar benefícios elegíveis
- Comunicar estado final ao cliente
- Registrar eventos e histórico do processo
- Tratar dados sensíveis com cuidado

Requisitos não funcionais:
- Arquitetura auditável e explicável
- Regras desacopladas do fluxo técnico
- Idempotência
- Observabilidade
- Segurança de dados sensíveis
- Design preparado para evolução futura

Decisões arquitetônicas desejadas:
- Node.js + TypeScript
- Preferência por NestJS
- Arquitetura hexagonal ou clean architecture
- Event-driven para processos de domínio
- Motor de regras determinístico, não IA generativa para a decisão principal
- Persistência de propostas, estado e histórico
- Integração desacoplada para card account creation e benefits activation
- API REST para front-end
- Possibilidade futura de integrar IA apenas como assistente de jornada, nunca como decisor final

Sua tarefa:
1. Propor a arquitetura de pastas e módulos
2. Definir bounded contexts ou módulos principais
3. Definir entidades, value objects, enums e casos de uso
4. Definir fluxo síncrono e assíncrono
5. Sugerir banco de dados e broker de eventos
6. Propor contratos de API
7. Propor eventos de domínio
8. Identificar riscos de negócio e técnicos
9. Mostrar decisões e trade-offs
10. Não gere tudo de uma vez: comece pela arquitetura geral e espere minha confirmação

Entrega esperada:
- Explicação da arquitetura
- Estrutura de pastas
- Lista de módulos
- Diagrama textual do fluxo
- Suposições explícitas
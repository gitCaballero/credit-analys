# Estratégia de Contexto e Memória

Este documento define uma estratégia prática de memória para este repositório, permitindo manter contexto com baixo custo, evitar análises repetidas da base e reduzir consumo de tokens.

## Objetivos

- minimizar redescoberta arquitetural
- manter a memória de trabalho focada na tarefa atual
- mover conhecimento estável para documentos do repositório, e não para o histórico da conversa
- reutilizar resumos compactos em vez de recarregar arquivos grandes
- encurtar ciclos futuros de análise, depuração e refatoração

## O que deve ser tratado como memória de longo prazo

Estes arquivos formam a camada durável de memória do projeto:

- `README.md`
  onboarding, execução local, endpoints e comportamento de alto nível

- `docs/state-machine.md`
  modelo canônico de ciclo de vida da proposta e dos estados operacionais

- `docs/prompt-guidance.md`
  resumo comprimido dos prompts originais e das restrições não funcionais

- `docs/prompt-outputs.md`
  decisões arquiteturais estendidas e orientações ainda não materializadas

- `docs/context-memory-strategy.md`
  playbook operacional de preservação de contexto e economia de tokens

## O que deve ficar apenas na memória de curto prazo

Mantenha ativos apenas os itens abaixo durante uma tarefa:

- pedido atual do usuário
- hipótese atual
- arquivos sob análise
- último resultado de build ou teste
- bloqueios abertos
- próximas 1 a 3 ações

Não carregue o conteúdo completo de arquivos nem raciocínio histórico irrelevante na memória ativa.

## Política de memória orientada ao repositório

Quando um fato for estável por mais de uma tarefa, registre-o uma única vez no repositório e deixe de reexplicá-lo em sessões futuras.

Exemplos típicos:

- limites de arquitetura
- regras de negócio
- contratos de API
- transições de estado
- premissas de integração externa
- comandos recorrentes de teste

## Regras de compressão de análise

### 1. Ler de forma estreita e resumir rápido

Depois de abrir um arquivo, converta o conteúdo em uma nota curta em vez de carregar o texto inteiro adiante.

Exemplos:

- `ProposalService mapeia HTTP para casos de uso e deve concentrar tradução de exceções`
- `A validação de oferta aprovava qualquer oferta elegível, e não a oferta escolhida`
- `O assistente depende da interpretação da ferramenta mais parâmetros opcionais da requisição`

### 2. Preferir deltas em vez de reexplicação completa

Ao revisitar um arquivo, registre apenas:

- estado anterior
- problema atual
- correção pretendida
- resultado da validação

### 3. Manter snapshots arquiteturais pequenos

Ao retomar o projeto, use um snapshot de 5 linhas:

- stack: NestJS + TypeORM + Postgres
- limites: domain / application / infrastructure / interfaces
- fluxo principal: criar -> validar oferta -> validar benefícios -> enviar -> criar cartão -> ativar benefícios
- assistente: endpoint com ferramentas via OpenAI ou fallback local
- persistência: proposals + outbox

## Fluxo de otimização de tokens

Para qualquer nova tarefa, siga esta sequência:

1. carregue apenas `README.md` e o doc mais relevante dentro de `docs/`
2. inspecione apenas os arquivos diretamente ligados ao comportamento pedido
3. escreva um resumo curto de trabalho antes de aprofundar
4. valide com `build` ou testes direcionados em vez de reabrir mais código
5. registre conclusões reutilizáveis em `docs/` se elas forem úteis novamente

## Antipadrões a evitar

- reler o repositório inteiro para corrigir um bug pequeno
- carregar saídas longas de comando para raciocínios futuros
- duplicar a mesma explicação arquitetural em vários arquivos Markdown
- embutir dumps crus de arquivo em resumos
- misturar notas de design estáveis com anotações transitórias de depuração

## Modelo sugerido de checkpoint de tarefa

Use este template compacto durante o trabalho:

```md
Tarefa
- Corrigir validação da oferta selecionada e repasse de parâmetros do assistente

Arquivos em foco
- src/application/use-cases/validate-offer-eligibility.use-case.ts
- src/domain/policies/offer-eligibility.policy.ts
- src/application/use-cases/chat-assistant.use-case.ts

Fatos atuais
- A validação de oferta aprovava quando qualquer oferta era elegível
- O fluxo de criação via chat perdia request parameters na fronteira de invoke

Validação
- npm run build
- npm test -- --runInBand

Próximo
- atualizar testes
- revisar docs de estado e memória
```

## Checkpoints reutilizáveis para este repositório

Antes de iniciar uma nova funcionalidade ou correção, responda sem abrir arquivos extras:

- a mudança é de lógica de domínio, orquestração de aplicação, contrato HTTP ou persistência?
- `docs/state-machine.md` já define o ciclo de vida pretendido?
- já existe teste para esse comportamento em `test/application` ou `test/interfaces`?
- o problema pode ser validado com teste direcionado em vez de leitura exploratória ampla?

## Cadência recomendada de manutenção da documentação

Atualize docs de memória de longo prazo quando:

- uma regra de negócio mudar
- uma transição de estado mudar
- um novo padrão de integração virar padrão do time
- uma mesma lição de depuração aparecer mais de uma vez
- um novo comando ou fluxo de validação virar padrão de trabalho

Não atualize docs para detalhes temporários de depuração.

## Benefícios esperados

Se este playbook for seguido com consistência, sessões futuras devem:

- gastar menos tempo redescobrindo a arquitetura
- evitar análise repetitiva dos mesmos fluxos
- reduzir o tamanho de prompt em trabalho iterativo
- produzir mudanças mais rápidas e direcionadas
- manter conhecimento durável dentro do repositório, e não apenas no histórico da conversa

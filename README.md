# Credit Origination Backend

Este projeto é uma API backend em Node.js + TypeScript com NestJS, TypeORM e PostgreSQL.

## Requisitos prévios

- Node.js 18+ e npm
- Docker (opcional, recomendado para banco de dados e contêineres)
- Git (opcional)

## Configuração inicial

1. Clone o repositório (se ainda não tiver feito):
   ```bash
   git clone <repo-url>
   cd credit-analys
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie um arquivo `.env` na raiz se quiser definir variáveis de ambiente locais.

## Executar o projeto localmente com Node.js

1. Certifique-se de ter PostgreSQL em execução localmente ou use Docker Compose.
2. Se utilizar PostgreSQL local, configure a conexão no `.env` ou na configuração da aplicação.
3. Inicie a aplicação em modo de desenvolvimento:
   ```bash
   npm start
   ```
4. A API ficará disponível em:
   ```text
   http://localhost:3000
   ```

## Executar com Docker Compose

Esta é a forma recomendada para subir a aplicação junto com o PostgreSQL.

1. Construa e suba os serviços:
   ```bash
   docker compose up --build
   ```
2. Aguarde até que o serviço `app` e o banco de dados `db` estejam em execução.
3. Acesse a API em:
   ```text
   http://localhost:3000
   ```
4. Neste projeto, o PostgreSQL fica exposto no host na porta `5433`.

### Executar apenas o CLI do assistente no Docker

1. Com o stack já em execução, execute o CLI do assistente:
   ```bash
   docker compose run --rm cli
   ```
2. Se precisar usar o CLI compilado a partir do contêiner `app`:
   ```bash
   docker compose run --rm app npm run assistant:cli:dist
   ```

### Reconstruir após alterações

Se modificar o código e quiser reconstruir os contêineres:
```bash
docker compose build --no-cache
```

## Comandos importantes

- `npm start`: executa a aplicação em modo de desenvolvimento com `ts-node-dev`
- `npm run build`: compila TypeScript em `dist`
- `npm run start:prod`: executa a aplicação compilada
- `npm run assistant:cli`: executa o CLI do assistente em modo de desenvolvimento
- `npm test`: executa os testes com Jest

## Endpoints principais

- `POST /proposals` - cria uma nova proposta de cartão
- `POST /proposals/:proposalId/offer-validation` - valida elegibilidade da oferta
- `POST /proposals/:proposalId/benefits-validation` - valida seleção de benefícios
- `POST /proposals/:proposalId/submit` - envia proposta para processamento
- `POST /proposals/:proposalId/card-creation` - solicita criação de conta de cartão
- `POST /proposals/:proposalId/benefits-activation` - ativa benefícios aprovados
- `GET /proposals/:proposalId/status` - consulta status da proposta
- `POST /assistant/message` - endpoint geral de compatibilidade para o assistente
- `POST /assistant/customer/message` - assistente dedicado ao cliente
- `POST /assistant/specialist/message` - assistente dedicado ao especialista de crédito

## Uso dos assistentes

Os assistentes conversacionais agora podem ser separados por audiência:

- cliente: captura de dados, seleção de benefícios e consulta de status
- especialista: validação de oferta, validação de benefícios, submit, criação de cartão, ativação de benefícios e consulta do caso

O endpoint `POST /assistant/message` continua disponível como rota geral.

### Assistente do cliente

Use `POST /assistant/customer/message` para a jornada do cliente.

### Variáveis de ambiente opcionais

- `OPENAI_API_KEY`: habilita o adaptador OpenAI para melhorar a interpretação de intenções.

Se não definir `OPENAI_API_KEY`, a aplicação usará um adaptador local de fallback que continua funcionando com regras básicas.

### Exemplo de solicitação para criar uma proposta

```bash
curl -X POST http://localhost:3000/assistant/customer/message \
  -H 'Content-Type: application/json' \
  -d '{
    "userMessage": "Quero solicitar um crédito com oferta A e cashback",
    "proposalId": "proposal-1",
    "parameters": {
      "customerProfile": {
        "fullName": "João Silva",
        "nationalId": "12345",
        "income": 2000,
        "investments": 1000,
        "currentAccountYears": 1,
        "email": "joao@example.com"
      },
      "offerType": "A",
      "selectedBenefits": ["CASHBACK"]
    }
  }'
```

### Exemplo de solicitação para consultar o status

```bash
curl -X POST http://localhost:3000/assistant/customer/message \
  -H 'Content-Type: application/json' \
  -d '{
    "userMessage": "Consulta o status da minha proposta proposal-1"
  }'
```

### Assistente do especialista

Use `POST /assistant/specialist/message` para executar o fluxo operacional da proposta.

Exemplo:

```bash
curl -X POST http://localhost:3000/assistant/specialist/message \
  -H 'Content-Type: application/json' \
  -d '{
    "userMessage": "Valida a oferta da proposta proposal-1",
    "proposalId": "proposal-1"
  }'
```

## Assistente CLI

O projeto inclui um assistente interativo em terminal que pode ser executado localmente ou em Docker.

### Como executar o assistente CLI localmente

1. Inicie a aplicação com:
   ```bash
   npm run assistant:cli
   ```
2. O CLI abre um prompt com instruções em português.
3. Você pode digitar:
  - um número para selecionar a opção desejada
  - uma mensagem em linguagem natural para o assistente interpretar
  - `perfil cliente` para o modo de atendimento do cliente
  - `perfil especialista` para o modo operacional do especialista
  - `opcoes`, `menu` ou `ajuda` para mostrar as opções novamente
  - `sair`, `exit` ou `quit` para encerrar
4. O assistente interativo faz perguntas para preencher os campos necessários.
5. Quando solicitar `proposalId`, ele também pode mostrar o último ID de proposta criado.

### Como executar o assistente CLI em Docker

1. Com o stack Docker já em execução, execute:
   ```bash
   docker compose run --rm cli
   ```
2. Para usar a versão compilada do CLI a partir do contêiner `app`:
   ```bash
   docker compose run --rm app npm run assistant:cli:dist
   ```

### Opções do assistente CLI

O assistente de terminal apresenta opções em português, como:

- solicitar um novo crédito com perfil, oferta e benefícios
- consultar status da proposta
- validar elegibilidade de oferta
- validar benefícios selecionados
- enviar proposta
- criar conta de cartão
- ativar benefícios
- explicar o status e decisões da proposta

### Benefícios válidos no CLI

- `cashback`
- `points`
- `travel` / `viagem`
- `vip` / `lounge`

## Notas rápidas

- No Docker, os serviços `app` e `cli` se conectam internamente ao `db` na porta `5432`.
- No host, o PostgreSQL está disponível em `localhost:5433`.
- Se usar PowerShell no Windows, substitua `export OPENAI_API_KEY=...` por:
  ```powershell
  $env:OPENAI_API_KEY = "sua_chave_aqui"
  ```

## Próximos passos

1. Instale dependências com `npm install`
2. Inicie o serviço com `npm start` ou `docker compose up --build`
3. Teste os endpoints em `http://localhost:3000`
4. Use `npm run build` e `npm run start:prod` para executar em modo produção

## Exemplos de uso

### 1. Criar uma proposta

```bash
curl -X POST http://localhost:3000/proposals \
  -H 'Content-Type: application/json' \
  -d '{
    "proposalId": "proposal-1",
    "customerProfile": {
      "fullName": "João Silva",
      "nationalId": "12345",
      "income": 2000,
      "investments": 1000,
      "currentAccountYears": 1,
      "email": "joao@example.com"
    },
    "offerType": "A",
    "selectedBenefits": []
  }'
```

Resposta esperada:

```json
{
  "proposalId": "proposal-1",
  "customerProfile": {
    "fullName": "João Silva",
    "nationalId": "*2345",
    "income": 2000,
    "investments": 1000,
    "currentAccountYears": 1,
    "email": "j***@example.com"
  },
  "offerType": "A",
  "selectedBenefits": [],
  "benefitActivationStatus": {},
  "auditEntries": [
    {
      "event": "proposal.created",
      "timestamp": "2026-04-16T00:03:18.48Z",
      "detail": "Proposal entity created"
    }
  ],
  "status": "RECEIVED",
  "cardCreationStatus": "NOT_CREATED"
}
```

### 2. Consultar status da proposta

```bash
curl http://localhost:3000/proposals/proposal-1/status
```

Resposta esperada:

```json
{
  "proposalId": "proposal-1",
  "status": "RECEIVED",
  "cardCreationStatus": "NOT_CREATED",
  "selectedBenefits": [],
  "benefitActivationStatus": {},
  "rejectionReason": null,
  "cardId": null
}
```

### 3. Validar elegibilidade da oferta

```bash
curl -X POST http://localhost:3000/proposals/proposal-1/offer-validation
```

Resposta esperada:

```json
{
  "proposalId": "proposal-1",
  "status": "OFFER_VALIDATED"
}
```

### 4. Validar benefícios

```bash
curl -X POST http://localhost:3000/proposals/proposal-1/benefits-validation \
  -H 'Content-Type: application/json' \
  -d '{
    "selectedBenefits": []
  }'
```

Resposta esperada:

```json
{
  "proposalId": "proposal-1",
  "status": "BENEFITS_VALIDATED",
  "selectedBenefits": []
}
```

### 5. Enviar proposta

```bash
curl -X POST http://localhost:3000/proposals/proposal-1/submit
```

Resposta esperada:

```json
{
  "proposalId": "proposal-1",
  "status": "SUBMITTED"
}
```

### 6. Criar conta de cartão

```bash
curl -X POST http://localhost:3000/proposals/proposal-1/card-creation
```

Resposta esperada:

```json
{
  "proposalId": "proposal-1",
  "cardId": "card-12345",
  "cardCreationStatus": "CREATED"
}
```

### 7. Ativar benefícios

```bash
curl -X POST http://localhost:3000/proposals/proposal-1/benefits-activation
```

Resposta esperada:

```json
{
  "proposalId": "proposal-1",
  "benefitActivationStatus": {
    "CASHBACK": "ACTIVATED"
  }
}
```

## Fluxo de exemplo completo

1. Criar proposta com `POST /proposals`
2. Validar a oferta com `POST /proposals/:proposalId/offer-validation`
3. Validar benefícios com `POST /proposals/:proposalId/benefits-validation`
4. Enviar proposta com `POST /proposals/:proposalId/submit`
5. Criar conta de cartão com `POST /proposals/:proposalId/card-creation`
6. Ativar benefícios com `POST /proposals/:proposalId/benefits-activation`
7. Consultar o estado com `GET /proposals/:proposalId/status`

## Variáveis de ambiente

É possível usar estas variáveis:

- `DB_HOST` (por padrão `db` no Docker)
- `DB_PORT` (por padrão `5432`)
- `DB_USER` (por padrão `postgres`)
- `DB_PASSWORD` (por padrão `postgres`)
- `DB_NAME` (por padrão `credit_originacion`)
- `PORT` (por padrão `3000`)
- `OPENAI_API_KEY` (opcional para o adaptador OpenAI)

Use o arquivo de exemplo `.env.example` como referência.

## Documentação adicional

O repositório inclui documentos técnicos organizados em `docs/`:

- `docs/prompt-outputs.md` - consolida outputs de prompts e orientações de arquitetura.
- `docs/state-machine.md` - estados e transições do ciclo de vida da proposta.
- `docs/flows.mmd` - fluxo ponta a ponta da originação do cartão, incluindo assistente IA e fallback local.
- `docs/sequence-overview.mmd` - visão unificada dos fluxos de cliente, especialista e contingência.
- `docs/flow-1-client-agent.mmd` - sequência do assistente do cliente.
- `docs/flow-2-credit-specialist-agent.mmd` - sequência do assistente do especialista.
- `docs/flow-3-direct-services.mmd` - sequência do fluxo direto por endpoints.
- `docs/context-memory-strategy.md` - estratégia de memória e economia de tokens.
- `docs/next-steps-recommendations.md` - recomendações para fortalecer arquitetura, segurança e operação.
- `docs/prompt-guidance.md` - resumo das instruções e prompts mais relevantes do projeto.

# Credit Origination Backend

Este proyecto es una API backend en Node.js + TypeScript con NestJS, TypeORM y Postgres.

## Ejecutar localmente

### con Node.js
1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Iniciar la base de datos local en Postgres o usar Docker Compose.
3. Ejecutar en modo desarrollo:
   ```bash
   npm start
   ```
4. Compilar y ejecutar producción:
   ```bash
   npm run build
   npm run start:prod
   ```

### con Docker y Docker Compose
1. Construir y levantar el stack:
   ```bash
   docker compose up --build
   ```
2. La aplicación quedará disponible en `http://localhost:3000`.
3. La base de datos Postgres está expuesta en el puerto `5432`.

## API Endpoints

La API expone los siguientes recursos:

- `POST /proposals` - crear una nueva propuesta de tarjeta
- `POST /proposals/:proposalId/offer-validation` - validar elegibilidad de oferta
- `POST /proposals/:proposalId/benefits-validation` - validar selección de beneficios
- `POST /proposals/:proposalId/submit` - enviar propuesta para procesamiento
- `POST /proposals/:proposalId/card-creation` - solicitar creación de cuenta de tarjeta
- `POST /proposals/:proposalId/benefits-activation` - activar beneficios aprobados
- `GET /proposals/:proposalId/status` - consultar estado de la propuesta
- `POST /assistant/message` - conversar con el asistente de crédito usando las herramientas internas de la aplicación

## Chat assistant

El asistente conversacional permite interactuar con la aplicación usando lenguaje natural para:

- solicitar una propuesta de crédito
- consultar el estado de una propuesta
- validar la elegibilidad de la oferta
- validar la selección de beneficios
- enviar la propuesta
- crear la cuenta de tarjeta
- activar beneficios
- pedir una explicación sobre la propuesta

Si `OPENAI_API_KEY` está definida en el entorno, el servicio usará un modelo OpenAI con mayor capacidad de contexto. Si no, usa un adaptador local de fallback que permite seguir usando el chat con un conjunto básico de reglas y herramientas.

Con el adaptador local, el asistente:

- muestra las opciones disponibles cuando le pides "ayuda" o "mostrar opciones"
- mantiene el flujo de la acción elegida (por ejemplo, solicitar crédito, consultar estado, validar beneficios)
- solicita los datos obligatorios uno por uno
- ejecuta la acción solo cuando ya tiene todos los datos requeridos

### Ejemplo de uso

```bash
curl -X POST http://localhost:3000/assistant/message \
  -H 'Content-Type: application/json' \
  -d '{
    "userMessage": "Quiero solicitar un crédito con oferta A y cashback",
    "proposalId": "proposal-1",
    "parameters": {
      "customerProfile": {
        "fullName": "Juan Perez",
        "nationalId": "12345",
        "income": 2000,
        "investments": 1000,
        "currentAccountYears": 1,
        "email": "juan@example.com"
      },
      "offerType": "A",
      "selectedBenefits": ["CASHBACK"]
    }
  }'
```

Respuesta esperada:

```json
{
  "message": "Propuesta creada con ID proposal-1. Continúa con la validación de la oferta o beneficios según prefieras.",
  "source": "chat-model",
  "toolName": "create_proposal",
  "toolResult": {
    "proposalId": "proposal-1",
    "customerProfile": {
      "fullName": "Juan Perez",
      "nationalId": "12345",
      "income": 2000,
      "investments": 1000,
      "currentAccountYears": 1,
      "email": "juan@example.com"
    },
    "offerType": "A",
    "selectedBenefits": ["CASHBACK"],
    "status": "RECEIVED",
    "cardCreationStatus": "NOT_CREATED"
  }
}
```

### Parámetros de entorno

- `OPENAI_API_KEY`: habilita el adaptador de OpenAI para la interpretación natural de la intención.

### Probar el chat assistant

1. Asegúrate de tener la aplicación ejecutándose en `http://localhost:3000`.
2. Usa el endpoint `POST /assistant/message` para enviar preguntas al asistente.

#### Con OpenAI

Si usas OpenAI, agrega tu clave en un archivo `.env` o exporta la variable de entorno:

```bash
export OPENAI_API_KEY=tu_clave_aqui
```

#### Sin OpenAI

Si no tienes `OPENAI_API_KEY`, el servicio seguirá funcionando con el adaptador local de fallback. Puedes probarlo con el mismo endpoint sin configurar la clave.

Ejemplo rápido sin API key:

```bash
curl -X POST http://localhost:3000/assistant/message \
  -H 'Content-Type: application/json' \
  -d '{
    "userMessage": "Consulta el estado de mi propuesta proposal-1"
  }'
```

Ejemplo de creación de propuesta sin API key:

```bash
curl -X POST http://localhost:3000/assistant/message \
  -H 'Content-Type: application/json' \
  -d '{
    "userMessage": "Quiero solicitar un crédito con oferta A y cashback",
    "proposalId": "proposal-1",
    "parameters": {
      "customerProfile": {
        "fullName": "Juan Perez",
        "nationalId": "12345",
        "income": 2000,
        "investments": 1000,
        "currentAccountYears": 1,
        "email": "juan@example.com"
      },
      "offerType": "A",
      "selectedBenefits": ["CASHBACK"]
    }
  }'
```

### Estructura de datos

#### `CreateProposalDto`

- `proposalId` (string): identificador único de la propuesta
- `customerProfile`: datos del cliente
  - `fullName` (string)
  - `nationalId` (string)
  - `income` (number)
  - `investments` (number)
  - `currentAccountYears` (number)
  - `email` (string)
- `offerType` (`A`, `B`, `C`)
- `selectedBenefits` (array de `BenefitType`): lista de beneficios seleccionados

#### `ValidateBenefitsDto`

- `selectedBenefits` (array de `BenefitType`)

## Ejemplos de uso

### 1. Crear una propuesta

```bash
curl -X POST http://localhost:3000/proposals \
  -H 'Content-Type: application/json' \
  -d '{
    "proposalId": "proposal-1",
    "customerProfile": {
      "fullName": "Juan Perez",
      "nationalId": "12345",
      "income": 2000,
      "investments": 1000,
      "currentAccountYears": 1,
      "email": "juan@example.com"
    },
    "offerType": "A",
    "selectedBenefits": []
  }'
```

Respuesta esperada:

```json
{
  "proposalId": "proposal-1",
  "customerProfile": {
    "fullName": "Juan Perez",
    "nationalId": "12345",
    "income": 2000,
    "investments": 1000,
    "currentAccountYears": 1,
    "email": "juan@example.com"
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

### 2. Consultar estado de la propuesta

```bash
curl http://localhost:3000/proposals/proposal-1/status
```

Respuesta esperada:

```json
{
  "proposalId": "proposal-1",
  "status": "RECEIVED",
  "cardCreationStatus": "NOT_CREATED",
  "selectedBenefits": [],
  "rejectionReason": null,
  "cardId": null
}
```

### 3. Validar elegibilidad de oferta

```bash
curl -X POST http://localhost:3000/proposals/proposal-1/offer-validation
```

Respuesta esperada:

```json
{
  "proposalId": "proposal-1",
  "status": "OFFER_VALIDATED"
}
```

### 4. Validar beneficios

```bash
curl -X POST http://localhost:3000/proposals/proposal-1/benefits-validation \
  -H 'Content-Type: application/json' \
  -d '{
    "selectedBenefits": []
  }'
```

Respuesta esperada:

```json
{
  "proposalId": "proposal-1",
  "status": "BENEFITS_VALIDATED",
  "selectedBenefits": []
}
```

### 5. Enviar propuesta

```bash
curl -X POST http://localhost:3000/proposals/proposal-1/submit
```

Respuesta esperada:

```json
{
  "proposalId": "proposal-1",
  "status": "SUBMITTED"
}
```

### 6. Crear cuenta de tarjeta

```bash
curl -X POST http://localhost:3000/proposals/proposal-1/card-creation
```

Respuesta esperada:

```json
{
  "proposalId": "proposal-1",
  "cardId": "card-12345",
  "cardCreationStatus": "CREATED"
}
```

### 7. Activar beneficios

```bash
curl -X POST http://localhost:3000/proposals/proposal-1/benefits-activation
```

Respuesta esperada:

```json
{
  "proposalId": "proposal-1",
  "benefitActivationStatus": {
    "CASHBACK": "ACTIVATED"
  }
}
```

## Flujo de ejemplo completo

1. Crear propuesta con `POST /proposals`
2. Validar oferta con `POST /proposals/:proposalId/offer-validation`
3. Validar beneficios con `POST /proposals/:proposalId/benefits-validation`
4. Enviar propuesta con `POST /proposals/:proposalId/submit`
5. Crear cuenta de tarjeta con `POST /proposals/:proposalId/card-creation`
6. Activar beneficios con `POST /proposals/:proposalId/benefits-activation`
7. Consultar estado con `GET /proposals/:proposalId/status`

## Variables de entorno

Se pueden usar estas variables:

- `DB_HOST` (por defecto `db` en Docker)
- `DB_PORT` (por defecto `5432`)
- `DB_USER` (por defecto `postgres`)
- `DB_PASSWORD` (por defecto `postgres`)
- `DB_NAME` (por defecto `credit_originacion`)
- `PORT` (por defecto `3000`)

Usar el archivo de ejemplo `.env.example` como referencia.

## Additional Documentation

The repository includes organized technical documents under `docs/`:

- `docs/prompt-outputs.md` - consolidated remaining prompt outputs and architecture guidance.
- `docs/state-machine.md` - proposal lifecycle states and transitions.
- `docs/context-memory-strategy.md` - memory and token economy strategy for working on the project.
- `docs/prompt-guidance.md` - summary of the most relevant prompts and implementation instructions.

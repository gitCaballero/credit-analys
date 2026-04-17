# Estructura del repositorio

Este documento describe la organización actualizada del proyecto y los límites de cada capa.

## Arquitectura principal

- `src/domain` - Modelo de dominio puro.
  - `entities/` - Entidades de negocio como `CreditCardProposal`, `CustomerProfile`, `BenefitSelection`.
  - `value-objects/` - Objetos de valor específicos del dominio.
  - `enums/` - Tipos fijos como `OfferType`, `BenefitType`, `ProposalStatus`.
  - `policies/` - Reglas de elegibilidad desacopladas del flujo técnico.
  - `events/` - Eventos de dominio y objetos inmutables de notificación.

- `src/application` - Casos de uso y servicios de orquestación.
  - `ports/` - Contratos de adaptadores e interfaces de infraestructura.
  - `services/` - Servicios de aplicación transversales como `AiAssistantService`.
  - `use-cases/` - Use cases que ejecutan la lógica de aplicación y publican eventos.

- `src/infrastructure` - Implementaciones técnicas externas.
  - `adapters/` - Adaptadores concretos para integraciones externas falsas y reales.
  - `repositories/` - Repositorios de persistencia.
  - `typeorm/` - Entidades y configuraciones de TypeORM.

- `src/interfaces` - Puertas de entrada y formatos de entrada/salida.
  - `http/` - API REST.
    - `controllers/` - Controladores HTTP por recurso.
    - `dto/` - DTOs de entrada y validación.
    - `services/` - Servicios de aplicación usados por la interfaz HTTP.
  - `cli/` - Interfaz de línea de comandos del asistente.

- `src/app.module.ts` - Punto de composición global.
- `src/main.ts` - Bootstrap de NestJS.

## Cambios de organización aplicados

- `src/interfaces/http/controllers/` ahora contiene los controladores REST.
- `src/interfaces/http/dto/` contiene todos los DTOs HTTP.
- `src/interfaces/http/services/` contiene el servicio de fachada para el API HTTP.
- `src/interfaces/cli/assistant-cli.ts` contiene el asistente de terminal.

## Impacto en scripts y despliegue

- `package.json` actualizó:
  - `assistant:cli` → `src/interfaces/cli/assistant-cli.ts`
  - `assistant:cli:dist` → `dist/interfaces/cli/assistant-cli.js`
- `docker-compose.yml` actualizó la entrada `cli` para ejecutar `dist/interfaces/cli/assistant-cli.js`.

## Guía rápida de archivos clave

- `README.md` - onboarding y endpoints públicos.
- `docs/context-memory-strategy.md` - máscara de memoria y estrategia de asistente.
- `docs/repo-structure.md` - este documento de organización.
- `src/interfaces/http/proposal.module.ts` - composición de inyecciones y dependencias de aplicación.
- `src/application/use-cases/` - flujo de negocio orquestado.
- `src/domain/policies/` - reglas de elegibilidad y validación de beneficios.

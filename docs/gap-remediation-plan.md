# Plan de Correccion de Gaps del Flujo de Solicitud de Tarjeta

## Objetivo

Este plan define los cambios necesarios para llevar la implementacion actual desde un estado `parcialmente conforme` a un estado `conforme` con la consigna original de arquitectura.

El foco del plan es cerrar los gaps detectados en:

- proteccion de transiciones de estado
- consulta final de estado
- definicion de finales del flujo
- alineacion entre codigo y documentacion
- tratamiento de datos sensibles

## Resultado esperado

Al finalizar este plan, el sistema deberia garantizar:

1. un inicio unico y bien definido del flujo
2. transiciones de negocio validas y protegidas
3. finales claros para exito, rechazo y fallas tecnicas
4. una consulta de estado final suficientemente completa para el cliente
5. documentacion alineada con la implementacion
6. controles minimos verificables sobre datos sensibles

## Prioridades

### Prioridad 1. Integridad del ciclo de vida

Esta prioridad corrige el riesgo mas importante: mutaciones incoherentes del agregado.

### Prioridad 2. Visibilidad del estado final

Esta prioridad cierra el gap entre lo que la consigna pide y lo que el cliente puede consultar.

### Prioridad 3. Claridad de finales y recuperacion

Esta prioridad define que significa terminar el flujo en escenarios no felices.

### Prioridad 4. Proteccion de datos sensibles

Esta prioridad transforma un requisito documental en una capacidad concreta del sistema.

### Prioridad 5. Calidad y alineacion documental

Esta prioridad asegura que tests y documentos no vuelvan a divergir del comportamiento real.

## Fase 1. Endurecer la maquina de estados

### Objetivo

Impedir transiciones invalidas y forzar el orden de negocio esperado.

### Cambios propuestos

1. Agregar guardas explicitas de estado en los casos de uso:

- `validate-offer-eligibility.use-case.ts`
- `validate-benefits.use-case.ts`
- `submit-proposal.use-case.ts`
- `create-card-account.use-case.ts`
- `activate-benefits.use-case.ts`

2. Centralizar las reglas de transicion en el agregado `CreditCardProposal` o en una politica de ciclo de vida.

3. Rechazar operaciones sobre propuestas en estados terminales:

- `REJECTED`
- `COMPLETED`

4. Permitir solo estas transiciones canonicas:

- `RECEIVED -> OFFER_VALIDATED`
- `RECEIVED -> REJECTED`
- `OFFER_VALIDATED -> BENEFITS_VALIDATED`
- `OFFER_VALIDATED -> REJECTED`
- `BENEFITS_VALIDATED -> SUBMITTED`
- `SUBMITTED -> CARD_ACCOUNT_CREATED`
- `CARD_ACCOUNT_CREATED -> COMPLETED`

### Archivos candidatos

- [credit-card-proposal.entity.ts](D:/credit-analys/src/domain/entities/credit-card-proposal.entity.ts)
- [validate-offer-eligibility.use-case.ts](D:/credit-analys/src/application/use-cases/validate-offer-eligibility.use-case.ts)
- [validate-benefits.use-case.ts](D:/credit-analys/src/application/use-cases/validate-benefits.use-case.ts)
- [submit-proposal.use-case.ts](D:/credit-analys/src/application/use-cases/submit-proposal.use-case.ts)
- [create-card-account.use-case.ts](D:/credit-analys/src/application/use-cases/create-card-account.use-case.ts)
- [activate-benefits.use-case.ts](D:/credit-analys/src/application/use-cases/activate-benefits.use-case.ts)

### Criterio de aceptacion

- no es posible validar beneficios desde `RECEIVED`
- no es posible revalidar oferta despues de `SUBMITTED`
- no es posible activar beneficios sin tarjeta creada
- no es posible mutar propuestas `REJECTED` o `COMPLETED`

## Fase 2. Completar la vista de estado final

### Objetivo

Hacer que la consulta de estado responda exactamente a la necesidad del cliente al final de la jornada.

### Cambios propuestos

1. Ampliar la respuesta de `getProposalStatus` para incluir:

- `benefitActivationStatus`
- opcionalmente `auditEntries` resumidos o ultimo evento relevante

2. Mantener la forma actual de respuesta compatible, agregando campos sin romper consumidores existentes.

3. Ajustar tests de servicio y controlador para cubrir la respuesta extendida.

### Archivos candidatos

- [get-proposal-status.use-case.ts](D:/credit-analys/src/application/use-cases/get-proposal-status.use-case.ts)
- [proposal.service.ts](D:/credit-analys/src/interfaces/http/services/proposal.service.ts)
- [proposal.controller.ts](D:/credit-analys/src/interfaces/http/controllers/proposal.controller.ts)
- [proposal.service.spec.ts](D:/credit-analys/test/interfaces/http/proposal.service.spec.ts)

### Criterio de aceptacion

- la consulta final devuelve `status`
- la consulta final devuelve `cardCreationStatus`
- la consulta final devuelve `cardId`
- la consulta final devuelve `benefitActivationStatus`

## Fase 3. Definir finales y reintentos del flujo

### Objetivo

Eliminar la ambiguedad de finales tecnicos y parciales.

### Decision de arquitectura recomendada

Mantener `status` como ciclo de vida canonico y `cardCreationStatus` como estado operativo, pero documentar y hacer cumplir estas reglas:

- `REJECTED` es final de negocio
- `COMPLETED` es final exitoso
- `SUBMITTED + FAILED` representa un estado recuperable por reintento tecnico
- activacion parcial de beneficios es un estado operativo visible pero no final exitoso

### Cambios propuestos

1. Documentar reintento explicito de creacion de tarjeta.
2. Decidir si la activacion parcial:

- queda como estado recuperable, o
- debe transformarse en una falla final de negocio

3. Si se mantiene recuperable, agregar una capacidad explicita de reintento de activacion.
4. Exponer claramente en la respuesta de estado cuando una propuesta esta:

- finalizada con exito
- rechazada
- pendiente por error tecnico
- parcial por activacion incompleta

### Archivos candidatos

- [credit-card-proposal.entity.ts](D:/credit-analys/src/domain/entities/credit-card-proposal.entity.ts)
- [activate-benefits.use-case.ts](D:/credit-analys/src/application/use-cases/activate-benefits.use-case.ts)
- [create-card-account.use-case.ts](D:/credit-analys/src/application/use-cases/create-card-account.use-case.ts)
- [state-machine.md](D:/credit-analys/docs/state-machine.md)
- [flows.mmd](D:/credit-analys/docs/flows.mmd)

### Criterio de aceptacion

- cada propuesta cae en un final claro o en un recuperable explicitamente documentado
- el cliente puede diferenciar facilmente exito, rechazo y pendiente tecnico

## Fase 4. Implementar proteccion minima de datos sensibles

### Objetivo

Reducir la exposicion innecesaria de PII en persistencia, logs, auditoria y eventos.

### Cambios propuestos

1. Enmascarar `nationalId` y `email` en respuestas, auditoria y logs.
2. Revisar el payload de outbox para no emitir PII innecesaria.
3. Introducir helpers de redaccion de datos sensibles.
4. Evaluar cifrado en reposo si el proyecto sale del alcance demo.
5. Revisar prompts y respuestas del asistente para no reenviar datos sensibles completos sin necesidad.

### Archivos candidatos

- [proposal.entity.ts](D:/credit-analys/src/infrastructure/typeorm/entities/proposal.entity.ts)
- [typeorm-proposal.repository.ts](D:/credit-analys/src/infrastructure/repositories/typeorm-proposal.repository.ts)
- [credit-card-proposal.entity.ts](D:/credit-analys/src/domain/entities/credit-card-proposal.entity.ts)
- [chat-assistant.use-case.ts](D:/credit-analys/src/application/use-cases/chat-assistant.use-case.ts)
- [openai-chat-model.adapter.ts](D:/credit-analys/src/infrastructure/adapters/openai-chat-model.adapter.ts)

### Criterio de aceptacion

- no se expone `nationalId` completo en salidas publicas
- los eventos no incluyen PII innecesaria
- existe una politica minima documentada de tratamiento de datos

## Fase 5. Alinear pruebas y documentacion

### Objetivo

Evitar nuevas divergencias entre comportamiento, tests y diagramas.

### Cambios propuestos

1. Corregir imports rotos en tests HTTP.
2. Actualizar expectativas de idioma y mensajes del asistente.
3. Agregar pruebas de transiciones invalidas.
4. Agregar pruebas de finales tecnicos y parciales.
5. Mantener `flows.mmd` y `state-machine.md` como reflejo del comportamiento vigente.

### Archivos candidatos

- [proposal.service.spec.ts](D:/credit-analys/test/interfaces/http/proposal.service.spec.ts)
- [assistant.controller.spec.ts](D:/credit-analys/test/interfaces/http/assistant.controller.spec.ts)
- [chat-assistant.use-case.spec.ts](D:/credit-analys/test/application/use-cases/chat-assistant.use-case.spec.ts)
- [flows.mmd](D:/credit-analys/docs/flows.mmd)
- [state-machine.md](D:/credit-analys/docs/state-machine.md)

### Criterio de aceptacion

- la suite de tests pasa
- hay cobertura de transiciones invalidas
- la documentacion coincide con el comportamiento real

## Orden de implementacion recomendado

1. Fase 1: endurecer la maquina de estados
2. Fase 2: completar la consulta final
3. Fase 3: definir finales y reintentos
4. Fase 5: actualizar tests y documentacion
5. Fase 4: aplicar proteccion de datos sensibles

Nota:

La fase 4 puede empezar en paralelo a la fase 5 si se mantiene acotada a masking y reduccion de PII.

## Riesgos a vigilar durante la implementacion

- romper compatibilidad de respuestas HTTP
- endurecer estados sin actualizar tests existentes
- introducir nuevas divergencias entre `status` y `cardCreationStatus`
- ocultar demasiados datos y dificultar soporte operativo

## Entregables esperados

Al cerrar el plan deberian existir:

- codigo con transiciones protegidas
- consulta final completa
- finales y reintentos documentados
- `flows.mmd` y `state-machine.md` alineados
- tests actualizados y en verde
- controles minimos de PII implementados

## Veredicto del plan

Este plan no cambia la naturaleza del proyecto, pero si lo convierte en una solucion mucho mas coherente con la consigna original y mas segura para evolucionar.

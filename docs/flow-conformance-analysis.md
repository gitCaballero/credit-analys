# Analisis de Conformidad del Flujo de Solicitud de Tarjeta

## Objetivo

Este documento evalua si el flujo implementado en el proyecto cumple la consigna original de arquitectura para la solicitud de tarjeta de credito con seleccion de beneficios, validaciones de elegibilidad, creacion de cuenta, activacion de beneficios, consulta de estado final, auditoria y cuidado de datos sensibles.

## Consigna original resumida

El flujo solicitado debe cubrir, como minimo, estos puntos:

1. Recibir una propuesta con datos personales, tipo de oferta y beneficios seleccionados.
2. Validar la elegibilidad de la oferta del tarjeta.
3. Validar la elegibilidad de los beneficios.
4. Crear la cuenta del tarjeta.
5. Activar los beneficios elegibles.
6. Comunicar al cliente el estado de la propuesta, si el tarjeta fue creado y que beneficios quedaron activados.
7. Registrar eventos e historico del proceso.
8. Tratar datos sensibles con cuidado.

Ademas, el flujo debe tener un inicio y un fin claros.

## Veredicto ejecutivo

La implementacion actual cumple buena parte de la consigna funcional, pero no es todavia 100% conforme al flujo arquitectonico esperado.

Estado general: `parcialmente conforme`

La base del flujo existe y funciona:

- recibe propuestas
- aplica reglas de elegibilidad
- permite crear la cuenta del tarjeta
- activa beneficios
- registra auditoria y eventos

Sin embargo, existen brechas importantes:

- no todas las transiciones de estado estan protegidas
- el estado final consultable no expone todos los datos pedidos
- el cierre del flujo ante fallas tecnicas no esta completamente definido
- el requisito de proteccion de datos sensibles no esta materializado de forma verificable
- el diagrama `docs/flows.mmd` no refleja exactamente el comportamiento real del codigo

## Lo que si cumple hoy

### 1. Recepcion de propuesta

La propuesta se recibe con:

- `proposalId`
- datos del cliente
- `offerType`
- `selectedBenefits`

Esto se implementa en:

- [create-proposal.use-case.ts](D:/credit-analys/src/application/use-cases/create-proposal.use-case.ts:28)
- [create-proposal.dto.ts](D:/credit-analys/src/interfaces/http/dto/create-proposal.dto.ts:33)

### 2. Validacion de oferta

Las reglas de elegibilidad de ofertas A, B y C estan implementadas y coinciden con la consigna:

- oferta A: renta mayor a 1000
- oferta B: renta mayor a 15000 e inversiones mayores a 5000
- oferta C: renta mayor a 50000 y cuenta corriente mayor a 2 anos

Esto se implementa en:

- [customer-profile.entity.ts](D:/credit-analys/src/domain/entities/customer-profile.entity.ts:44)
- [offer-eligibility.policy.ts](D:/credit-analys/src/domain/policies/offer-eligibility.policy.ts:8)

### 3. Validacion de beneficios

Las reglas de beneficios tambien estan implementadas:

- `CASHBACK` y `POINTS` no pueden coexistir
- `TRAVEL_INSURANCE` solo aplica a oferta C
- `VIP_LOUNGE` solo aplica a ofertas B y C

Esto se implementa en:

- [benefit-selection.entity.ts](D:/credit-analys/src/domain/entities/benefit-selection.entity.ts:17)
- [benefit-eligibility.policy.ts](D:/credit-analys/src/domain/policies/benefit-eligibility.policy.ts:8)

### 4. Creacion de cuenta del tarjeta

La creacion de cuenta esta implementada y solo avanza cuando la propuesta fue enviada:

- [create-card-account.use-case.ts](D:/credit-analys/src/application/use-cases/create-card-account.use-case.ts:13)

### 5. Activacion de beneficios

La activacion de beneficios se ejecuta cuando la cuenta del tarjeta fue creada:

- [activate-benefits.use-case.ts](D:/credit-analys/src/application/use-cases/activate-benefits.use-case.ts:16)

### 6. Auditoria y eventos

La propuesta registra historial y los casos de uso publican eventos de outbox:

- [credit-card-proposal.entity.ts](D:/credit-analys/src/domain/entities/credit-card-proposal.entity.ts:51)
- [outbox-event.publisher.ts](D:/credit-analys/src/application/services/outbox-event.publisher.ts:13)

## Gaps que impiden la conformidad total

### 1. El flujo no esta completamente protegido por estados

La consigna implica una secuencia de negocio:

`RECEIVED -> OFFER_VALIDATED -> BENEFITS_VALIDATED -> SUBMITTED -> CARD_ACCOUNT_CREATED -> COMPLETED`

El proyecto documenta esa maquina de estados en:

- [state-machine.md](D:/credit-analys/docs/state-machine.md:47)

Pero el codigo no hace cumplir todas esas transiciones:

- [validate-offer-eligibility.use-case.ts](D:/credit-analys/src/application/use-cases/validate-offer-eligibility.use-case.ts:19)
- [validate-benefits.use-case.ts](D:/credit-analys/src/application/use-cases/validate-benefits.use-case.ts:19)

Problema:

- una propuesta puede ser validada fuera de secuencia
- una propuesta ya rechazada o ya avanzada puede volver a mutar de forma incoherente

Impacto:

- el flujo implementado no garantiza la jornada pedida por la arquitectura

### 2. La consulta de estado final no devuelve todos los datos requeridos

La consigna pide que al final el cliente pueda visualizar:

- estado de la propuesta
- si el tarjeta fue creado o no
- que beneficios fueron activados

La consulta actual devuelve:

- `status`
- `cardCreationStatus`
- `selectedBenefits`
- `rejectionReason`
- `cardId`

Implementacion:

- [get-proposal-status.use-case.ts](D:/credit-analys/src/application/use-cases/get-proposal-status.use-case.ts:11)

Gap:

- no devuelve `benefitActivationStatus`

Impacto:

- el cliente no puede ver en una sola consulta final cuales beneficios quedaron activados realmente

### 3. El fin del flujo no esta definido de forma consistente para fallas tecnicas

Hoy existen al menos tres cierres posibles:

- exito total: `COMPLETED`
- rechazo de negocio: `REJECTED`
- falla tecnica al crear tarjeta: `cardCreationStatus = FAILED`

Implementacion:

- [credit-card-proposal.entity.ts](D:/credit-analys/src/domain/entities/credit-card-proposal.entity.ts:90)
- [create-card-account.use-case.ts](D:/credit-analys/src/application/use-cases/create-card-account.use-case.ts:49)

Gap:

- la falla tecnica no se refleja como un cierre explicito del flujo principal
- el proceso queda a medio camino desde el punto de vista de negocio

Impacto:

- el flujo tiene un inicio claro, pero no un fin igualmente claro para todos los escenarios

### 4. El diagrama `flows.mmd` no coincide exactamente con la implementacion

Documento actual:

- [flows.mmd](D:/credit-analys/docs/flows.mmd:1)

Desalineaciones detectadas:

- en la falla de creacion de tarjeta, el diagrama muestra `NOT_CREATED`, pero el codigo usa `FAILED`
- el diagrama menciona `benefits.activation.requested`, pero el codigo publica `benefits.activated`
- el diagrama sugiere una secuencia mas estricta de la que el codigo realmente fuerza

Impacto:

- el flujo documental no representa fielmente el comportamiento actual del sistema

### 5. El tratamiento de datos sensibles no esta implementado de forma verificable

La consigna exige tratar datos sensibles con cuidado.

Persistencia actual:

- [proposal.entity.ts](D:/credit-analys/src/infrastructure/typeorm/entities/proposal.entity.ts:10)

Datos sensibles visibles:

- nombre completo
- documento nacional
- email
- ingresos
- inversiones

Gap:

- no se observa cifrado
- no se observa enmascaramiento
- no se observa minimizacion de datos
- no se observan reglas de redaccion para auditoria o respuestas

Impacto:

- el requisito existe a nivel de discurso, pero no como capacidad comprobable del sistema

## Inicio y fin del flujo

### Inicio

El inicio del flujo esta correctamente definido:

- el cliente envia la propuesta
- el sistema crea la entidad
- la propuesta queda en estado `RECEIVED`

Referencias:

- [create-proposal.use-case.ts](D:/credit-analys/src/application/use-cases/create-proposal.use-case.ts:28)
- [credit-card-proposal.entity.ts](D:/credit-analys/src/domain/entities/credit-card-proposal.entity.ts:35)

### Fin

El fin exitoso del flujo esta correctamente definido:

- si la tarjeta se crea
- si los beneficios se activan
- si todo sale bien
- la propuesta termina en `COMPLETED`

Referencia:

- [activate-benefits.use-case.ts](D:/credit-analys/src/application/use-cases/activate-benefits.use-case.ts:43)

El problema aparece en los finales no exitosos:

- `REJECTED` si falla una validacion de negocio
- `FAILED` en la creacion de tarjeta por problema tecnico

El segundo caso no esta modelado como un final de negocio claro.

## Ajustes necesarios para quedar 100% conforme

### Ajuste 1. Proteger todas las transiciones de estado

Agregar validaciones explicitas de precondiciones:

- validar oferta solo desde `RECEIVED`
- validar beneficios solo desde `OFFER_VALIDATED`
- impedir revalidaciones incoherentes
- impedir avanzar una propuesta `REJECTED` o `COMPLETED`

### Ajuste 2. Exponer el estado final completo

Ampliar la consulta de estado para incluir:

- `benefitActivationStatus`

Con eso el cliente podra ver en un unico punto:

- estado de propuesta
- estado de creacion del tarjeta
- beneficios activados o fallidos

### Ajuste 3. Definir el cierre del flujo ante errores tecnicos

Elegir y documentar una de estas estrategias:

1. Considerar `FAILED` como fin operativo consultable.
2. Permitir reintento explicito y modelarlo en el flujo.
3. Convertir la falla tecnica en un estado final de negocio independiente.

Lo importante es que el flujo tenga un cierre claro tambien en escenarios no felices.

### Ajuste 4. Alinear `flows.mmd` con el codigo real

El diagrama debe reflejar:

- estados reales
- eventos reales
- reintentos reales o finales reales
- secuencia efectivamente permitida por el sistema

### Ajuste 5. Implementar controles concretos de datos sensibles

Como minimo, se recomienda:

- evitar exponer `nationalId` completo en respuestas y auditorias
- revisar si corresponde cifrar o tokenizar campos sensibles en persistencia
- limitar datos personales en eventos de outbox
- documentar una politica minima de tratamiento de datos

## Conclusion final

El flujo implementado es una buena base y cubre la mayor parte de la consigna funcional. Sin embargo, todavia no puede considerarse totalmente correcto desde el punto de vista arquitectonico.

Conclusion formal:

- `cumplimiento funcional base`: si
- `cumplimiento arquitectonico completo`: no
- `estado final de evaluacion`: parcialmente conforme

Para considerar el ejercicio correctamente cerrado, deben corregirse al menos:

1. las guardas de transicion de estados
2. la consulta final de estado para incluir beneficios activados
3. la definicion del fin del flujo ante fallas tecnicas
4. la alineacion del `mmd` con la implementacion
5. el tratamiento verificable de datos sensibles

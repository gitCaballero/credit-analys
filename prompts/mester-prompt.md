Quiero que actúes como un Software Architect senior especializado en originación de tarjetas de crédito, onboarding digital, reglas de elegibilidad y sistemas event-driven.

Diseña y genera una solución backend en Node.js + TypeScript para un flujo de solicitud de tarjeta de crédito donde el cliente puede elegir beneficios durante la jornada.

Contexto de negocio:
- Existen 3 ofertas de tarjeta:
  - Oferta A: renta > 1000
  - Oferta B: renta > 15000 e inversiones > 5000
  - Oferta C: renta > 50000 y cuenta corriente con más de 2 años
- Beneficios:
  - Cashback: incompatible con Puntos
  - Puntos: incompatible con Cashback
  - Seguro de viaje: solo para oferta C
  - Sala VIP: solo para ofertas B y C
- Al final el cliente debe visualizar:
  - estado de la propuesta
  - si la cuenta tarjeta fue creada o no
  - qué beneficios quedaron activados

Requisitos funcionales mínimos:
- Recibir propuesta con datos personales, tipo de oferta y selección de beneficios
- Validar elegibilidad de oferta y beneficios
- Crear cuenta tarjeta
- Activar beneficios elegibles
- Comunicar estado final al cliente
- Registrar eventos e histórico del proceso
- Tratar datos sensibles con cuidado

Requisitos no funcionales:
- Arquitectura auditable y explicable
- Reglas desacopladas del flujo técnico
- Idempotencia
- Observabilidad
- Seguridad de datos sensibles
- Diseño preparado para evolución futura

Decisiones arquitectónicas deseadas:
- Node.js + TypeScript
- Preferencia por NestJS
- Arquitectura hexagonal o clean architecture
- Event-driven para procesos de dominio
- Motor de reglas determinístico, no IA generativa para la decisión principal
- Persistencia de propuestas, estado e histórico
- Integración desacoplada para card account creation y benefits activation
- API REST para front-end
- Posibilidad futura de integrar IA solo como asistente de jornada, nunca como decisor final

Tu tarea:
1. Proponer la arquitectura de carpetas y módulos
2. Definir bounded contexts o módulos principales
3. Definir entidades, value objects, enums y casos de uso
4. Definir flujo síncrono y asíncrono
5. Sugerir base de datos y broker de eventos
6. Proponer contratos de API
7. Proponer eventos de dominio
8. Identificar riesgos de negocio y técnicos
9. Mostrar decisiones y trade-offs
10. No generes todo de una vez: empieza por la arquitectura general y espera mi confirmación

Entrega esperada:
- Explicación de arquitectura
- Estructura de carpetas
- Lista de módulos
- Diagrama textual del flujo
- Supuestos explícitos
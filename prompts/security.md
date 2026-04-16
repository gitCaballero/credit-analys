Genera la estrategia de seguridad para el sistema de solicitud de tarjeta de crédito.

Necesito recomendaciones y ejemplos de implementación para:
- protección de datos sensibles
- cifrado en tránsito y en reposo
- enmascaramiento en logs
- control de acceso
- secrets management
- validación de entrada
- protección contra replay o duplicación
- idempotencia
- trazabilidad y auditoría
- separación entre datos de negocio y datos sensibles

Contexto:
- El sistema procesa datos personales y financieros
- Debe ser auditable
- Debe evitar exposición innecesaria de PII
- La cuenta corriente ya existe, pero el sistema crea la cuenta tarjeta
- Debe haber logs útiles sin filtrar información sensible

Quiero:
- lineamientos de arquitectura
- middleware/guards/interceptors sugeridos en NestJS
- utilidades para mascarar datos
- estrategia de clasificación de datos
- checklist de seguridad para producción
Diseña la persistencia de datos para esta solución usando PostgreSQL.

Necesito:
- modelo relacional inicial
- tablas principales
- claves primarias y foráneas
- índices
- campos de auditoría
- estrategia para histórico de estados
- estrategia para event outbox
- estrategia para datos sensibles

Tablas esperadas como mínimo:
- proposals
- proposal_status_history
- selected_benefits
- activated_benefits
- audit_entries
- outbox_events

Quiero que definas:
- columnas
- tipos sugeridos
- restricciones
- qué datos deben cifrarse o mascararse
- cómo modelar versiones de reglas aplicadas
- cómo modelar errores técnicos vs errores de negocio

Entrega:
- SQL inicial o entities para ORM
- explicación de diseño
- decisiones de normalización
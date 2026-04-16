Genera la estrategia de testing para esta solución.

Quiero cobertura para:
- unit tests del dominio
- unit tests del motor de elegibilidad
- integration tests de repositorios
- tests de API
- contract tests para integraciones externas
- pruebas de idempotencia
- pruebas de eventos
- casos negativos

Incluye escenarios mínimos:
1. Cliente elegible a oferta A y selecciona Cashback
2. Cliente elegible a oferta B y selecciona Sala VIP + Puntos
3. Cliente intenta seleccionar Cashback y Puntos juntos
4. Cliente intenta Seguro de viaje con oferta A
5. Cliente no elegible a la oferta elegida
6. Falla la creación de tarjeta
7. Se crea la tarjeta pero falla activación de un beneficio
8. Reintento del mismo submit con mismo idempotency key

Entrega:
- matriz de casos de prueba
- estructura de archivos test
- ejemplos con Jest
- recomendaciones de fixtures y builders
Genera la especificación de API REST para el sistema de solicitud de tarjeta de crédito.

Endpoints mínimos:
- POST /proposals
- POST /proposals/{proposalId}/offer-validation
- GET /proposals/{proposalId}/eligible-benefits
- POST /proposals/{proposalId}/benefits-validation
- POST /proposals/{proposalId}/submit
- GET /proposals/{proposalId}/status

Quiero:
- request/response DTOs
- códigos HTTP correctos
- ejemplos JSON
- validaciones
- errores esperados
- contrato consistente y fácil de consumir por frontend

Restricciones:
- No exponer información sensible innecesaria
- Mascarar datos delicados en respuestas y logs
- Incluir correlationId y requestId
- Respuestas pensadas para una UI que necesita mostrar:
  - estatus de propuesta
  - tarjeta creada o no
  - beneficios activados
  - mensajes de negocio entendibles

Si lo consideras mejor, puedes agregar endpoints adicionales, pero justifica cada uno.
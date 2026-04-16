Ahora genera el modelo de dominio en TypeScript para la solución de solicitud de tarjeta de crédito.

Quiero que definas:
- entidades
- value objects
- enums
- agregados
- invariantes de negocio

Debes contemplar como mínimo:
- CreditCardProposal
- CustomerProfile
- SelectedOffer
- BenefitSelection
- ProposalStatus
- CardCreationStatus
- BenefitActivationStatus
- AuditEntry

Reglas de negocio obligatorias:
- Oferta A: renta > 1000
- Oferta B: renta > 15000 e inversiones > 5000
- Oferta C: renta > 50000 y cuenta corriente > 2 años
- Cashback y Puntos son mutuamente excluyentes
- Seguro de viaje solo con oferta C
- Sala VIP solo con oferta B o C

Quiero que modeles las reglas como invariantes explícitas del dominio cuando sea posible, y como políticas/servicios de dominio cuando corresponda.

Entrega:
- código TypeScript
- comentarios breves y útiles
- nombres claros
- sin dependencias de framework en domain
- usa principios DDD
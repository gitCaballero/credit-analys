Genera los casos de uso de aplicación para el flujo de originación de tarjeta.

Casos de uso mínimos:
- CreateProposalUseCase
- ValidateOfferEligibilityUseCase
- GetEligibleBenefitsUseCase
- ValidateBenefitSelectionUseCase
- SubmitProposalUseCase
- CreateCardAccountUseCase
- ActivateBenefitsUseCase
- GetProposalStatusUseCase

Requisitos:
- Cada caso de uso debe tener input y output explícitos
- Debe existir separación entre comando y resultado
- Debe haber manejo de errores de negocio y técnicos
- Debe quedar claro qué parte es síncrona y cuál asíncrona
- Debe ser fácil de probar
- Debe seguir clean architecture

Entrega:
- interfaces
- implementaciones base
- contratos de repositorio necesarios
- puertos para servicios externos
- explicación breve del flujo entre casos de uso
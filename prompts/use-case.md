Gere os casos de uso de aplicação para o fluxo de originação de cartões.

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
- Cada caso de uso deve ter input e output explícitos
- Deve existir separação entre comando e resultado
- Deve haver tratamento de erros de negócio e técnicos
- Deve ficar claro qual parte é síncrona e qual é assíncrona
- Deve ser fácil de testar
- Deve seguir clean architecture

Entrega:
- interfaces
- implementações base
- contratos de repositório necessários
- portas para serviços externos
- explicação breve do fluxo entre casos de uso
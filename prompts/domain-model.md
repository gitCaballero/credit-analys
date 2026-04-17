Agora gere o modelo de domínio em TypeScript para a solução de solicitação de cartão de crédito.

Quero que defina:
- entidades
- value objects
- enums
- agregados
- invariantes de negócio

Deve contemplar no mínimo:
- CreditCardProposal
- CustomerProfile
- SelectedOffer
- BenefitSelection
- ProposalStatus
- CardCreationStatus
- BenefitActivationStatus
- AuditEntry

Regras de negócio obrigatórias:
- Oferta A: renda > 1000
- Oferta B: renda > 15000 e investimentos > 5000
- Oferta C: renda > 50000 e conta corrente > 2 anos
- Cashback e Pontos são mutuamente exclusivos
- Seguro de viagem apenas com oferta C
- Sala VIP apenas com oferta B ou C

Quero que modele as regras como invariantes explícitas do domínio quando possível, e como políticas/serviços de domínio quando for apropriado.

Entrega:
- código TypeScript
- comentários breves e úteis
- nomes claros
- sem dependências de framework em domain
- use princípios DDD
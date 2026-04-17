Gere um módulo de Eligibility em TypeScript desacoplado do framework, com foco em regras determinísticas e auditáveis.

Objetivo:
- Avaliar se uma oferta é elegível
- Avaliar se os benefícios selecionados são elegíveis
- Devolver resultado estruturado com motivos, códigos e evidências de decisão

Preciso de:
1. Um serviço de domínio OfferEligibilityPolicy
2. Um serviço de domínio BenefitEligibilityPolicy
3. Um objeto de resposta como EligibilityResult com:
   - approved: boolean
   - reasons: string[]
   - rejectedRules: string[]
   - eligibleOffers?: OfferType[]
   - eligibleBenefits?: BenefitType[]
   - policyVersion: string
4. Regras versionadas
5. Testes unitários completos

Considerações:
- Não hardcodear regras dispersas em múltiplos arquivos
- As regras devem ser fáceis de mudar
- O resultado deve ser totalmente rastreável e explicável
- Não usar IA nem bibliotecas de rule engine externas nesta primeira versão
- Desenhe para poder migrar depois para um motor externo se necessário

Além disso, proponha uma estratégia para externalizar essas regras para JSON ou configuração em uma segunda fase.
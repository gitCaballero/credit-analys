Genera un módulo de Eligibility en TypeScript desacoplado del framework, con foco en reglas determinísticas y auditables.

Objetivo:
- Evaluar si una oferta es elegible
- Evaluar si los beneficios seleccionados son elegibles
- Devolver resultado estructurado con motivos, códigos y evidencias de decisión

Necesito:
1. Un servicio de dominio OfferEligibilityPolicy
2. Un servicio de dominio BenefitEligibilityPolicy
3. Un objeto de respuesta como EligibilityResult con:
   - approved: boolean
   - reasons: string[]
   - rejectedRules: string[]
   - eligibleOffers?: OfferType[]
   - eligibleBenefits?: BenefitType[]
   - policyVersion: string
4. Reglas versionadas
5. Pruebas unitarias completas

Consideraciones:
- No hardcodear reglas dispersas en múltiples archivos
- Las reglas deben ser fáciles de cambiar
- El resultado debe ser totalmente trazable y explicable
- No usar IA ni librerías de rules engine externas en esta primera versión
- Diseña para poder migrar después a un motor externo si fuera necesario

Además, propón una estrategia para externalizar estas reglas a JSON o configuración en una segunda fase.
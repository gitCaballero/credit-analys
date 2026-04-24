import { BenefitType } from '../../../domain/enums/benefit-type.enum';
export interface ActivateBenefitPayload {
    proposalId: string;
    cardId: string;
    benefit: BenefitType;
}
export interface BenefitActivationResponse {
    success: boolean;
    benefit: BenefitType;
    reason?: string;
}
export interface BenefitsPort {
    activateBenefit(payload: ActivateBenefitPayload): Promise<BenefitActivationResponse>;
}

import { ActivateBenefitPayload, BenefitActivationResponse, BenefitsPort } from '../../application/ports/outbound/benefits.port';
export declare class FakeBenefitsAdapter implements BenefitsPort {
    activateBenefit(payload: ActivateBenefitPayload): Promise<BenefitActivationResponse>;
}

import { BenefitsAdapter, BenefitActivationResponse, ActivateBenefitPayload } from '../../application/ports/benefits.adapter';
export declare class FakeBenefitsAdapter implements BenefitsAdapter {
    activateBenefit(payload: ActivateBenefitPayload): Promise<BenefitActivationResponse>;
}

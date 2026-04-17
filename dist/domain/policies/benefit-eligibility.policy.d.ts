import { BenefitType } from '../enums/benefit-type.enum';
import { OfferType } from '../enums/offer-type.enum';
import { EligibilityResult } from './eligibility-result';
export declare class BenefitEligibilityPolicy {
    static readonly POLICY_VERSION = "1.0.0";
    evaluate(offer: OfferType, selectedBenefits: BenefitType[]): EligibilityResult;
}

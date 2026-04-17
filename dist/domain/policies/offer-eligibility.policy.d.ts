import { OfferType } from '../enums/offer-type.enum';
import { CustomerProfile } from '../entities/customer-profile.entity';
import { EligibilityResult } from './eligibility-result';
export declare class OfferEligibilityPolicy {
    static readonly POLICY_VERSION = "1.0.0";
    evaluate(customer: CustomerProfile, selectedOffer?: OfferType): EligibilityResult;
}

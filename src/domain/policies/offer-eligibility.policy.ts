import { OfferType } from '../enums/offer-type.enum';
import { CustomerProfile } from '../entities/customer-profile.entity';
import { EligibilityResult } from './eligibility-result';

export class OfferEligibilityPolicy {
  static readonly POLICY_VERSION = '1.0.0';

  evaluate(customer: CustomerProfile, selectedOffer?: OfferType): EligibilityResult {
    const eligibleOffers: OfferType[] = [];
    const rejectedRules: string[] = [];
    const reasons: string[] = [];

    Object.values(OfferType).forEach((offer) => {
      const valid = customer.isEligibleForOffer(offer);
      if (valid) {
        eligibleOffers.push(offer);
      } else {
        rejectedRules.push(`Offer ${offer} eligibility not satisfied`);
      }
    });

    const approved = selectedOffer ? eligibleOffers.includes(selectedOffer) : eligibleOffers.length > 0;

    if (selectedOffer) {
      if (approved) {
        reasons.push(`Customer is eligible for selected offer ${selectedOffer}`);
      } else {
        reasons.push(`Customer is not eligible for selected offer ${selectedOffer}`);
      }
    } else if (eligibleOffers.length > 0) {
      reasons.push(`Customer is eligible for ${eligibleOffers.join(', ')}`);
    } else {
      reasons.push('Customer does not meet any offer eligibility requirements');
    }

    return new EligibilityResult(
      approved,
      reasons,
      rejectedRules,
      OfferEligibilityPolicy.POLICY_VERSION,
      eligibleOffers,
    );
  }
}

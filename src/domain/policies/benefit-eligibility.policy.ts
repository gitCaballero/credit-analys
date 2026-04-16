import { BenefitType } from '../enums/benefit-type.enum';
import { OfferType } from '../enums/offer-type.enum';
import { EligibilityResult } from './eligibility-result';

export class BenefitEligibilityPolicy {
  static readonly POLICY_VERSION = '1.0.0';

  evaluate(offer: OfferType, selectedBenefits: BenefitType[]): EligibilityResult {
    const rejectedRules: string[] = [];
    const reasons: string[] = [];
    const eligibleBenefits: BenefitType[] = [];

    if (selectedBenefits.includes(BenefitType.CASHBACK) && selectedBenefits.includes(BenefitType.POINTS)) {
      rejectedRules.push('Cashback and Points cannot be selected together');
    }

    selectedBenefits.forEach((benefit) => {
      switch (benefit) {
        case BenefitType.CASHBACK:
        case BenefitType.POINTS:
          eligibleBenefits.push(benefit);
          break;
        case BenefitType.TRAVEL_INSURANCE:
          if (offer === OfferType.C) {
            eligibleBenefits.push(benefit);
          } else {
            rejectedRules.push('Travel insurance is only available for offer C');
          }
          break;
        case BenefitType.VIP_LOUNGE:
          if (offer === OfferType.B || offer === OfferType.C) {
            eligibleBenefits.push(benefit);
          } else {
            rejectedRules.push('VIP lounge is only available for offers B and C');
          }
          break;
        default:
          rejectedRules.push(`Unknown benefit type: ${benefit}`);
      }
    });

    if (rejectedRules.length === 0) {
      reasons.push('Selected benefits are eligible for the requested offer');
    } else {
      reasons.push('Some selected benefits are not eligible');
    }

    return new EligibilityResult(
      rejectedRules.length === 0,
      reasons,
      rejectedRules,
      BenefitEligibilityPolicy.POLICY_VERSION,
      [],
      eligibleBenefits,
    );
  }
}

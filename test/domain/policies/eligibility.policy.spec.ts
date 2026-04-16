import { BenefitEligibilityPolicy } from '../../../src/domain/policies/benefit-eligibility.policy';
import { OfferType } from '../../../src/domain/enums/offer-type.enum';
import { BenefitType } from '../../../src/domain/enums/benefit-type.enum';

describe('BenefitEligibilityPolicy', () => {
  const policy = new BenefitEligibilityPolicy();

  it('approves valid benefits for offer C', () => {
    const result = policy.evaluate(OfferType.C, [BenefitType.TRAVEL_INSURANCE, BenefitType.VIP_LOUNGE]);

    expect(result.approved).toBe(true);
    expect(result.eligibleBenefits).toEqual([BenefitType.TRAVEL_INSURANCE, BenefitType.VIP_LOUNGE]);
    expect(result.rejectedRules).toHaveLength(0);
  });

  it('rejects travel insurance for offer A', () => {
    const result = policy.evaluate(OfferType.A, [BenefitType.TRAVEL_INSURANCE]);

    expect(result.approved).toBe(false);
    expect(result.rejectedRules).toContain('Travel insurance is only available for offer C');
  });

  it('rejects cashback and points when selected together', () => {
    const result = policy.evaluate(OfferType.B, [BenefitType.CASHBACK, BenefitType.POINTS]);

    expect(result.approved).toBe(false);
    expect(result.rejectedRules).toContain('Cashback and Points cannot be selected together');
  });
});

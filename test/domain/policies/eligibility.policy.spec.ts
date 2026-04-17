import { BenefitEligibilityPolicy } from '../../../src/domain/policies/benefit-eligibility.policy';
import { OfferEligibilityPolicy } from '../../../src/domain/policies/offer-eligibility.policy';
import { OfferType } from '../../../src/domain/enums/offer-type.enum';
import { BenefitType } from '../../../src/domain/enums/benefit-type.enum';
import { CustomerProfile } from '../../../src/domain/entities/customer-profile.entity';

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

describe('OfferEligibilityPolicy', () => {
  const policy = new OfferEligibilityPolicy();

  it('approves when the selected offer is eligible', () => {
    const customer = new CustomerProfile('Jane Doe', '12345678', 20000, 7000, 3, 'jane@example.com');

    const result = policy.evaluate(customer, OfferType.B);

    expect(result.approved).toBe(true);
    expect(result.eligibleOffers).toContain(OfferType.B);
  });

  it('rejects when the selected offer is not eligible even if another offer is', () => {
    const customer = new CustomerProfile('John Doe', '87654321', 2500, 100, 1, 'john@example.com');

    const result = policy.evaluate(customer, OfferType.C);

    expect(result.approved).toBe(false);
    expect(result.eligibleOffers).toContain(OfferType.A);
    expect(result.reasons).toContain('Customer is not eligible for selected offer C');
  });
});

import { BenefitType } from '../enums/benefit-type.enum';

/**
 * BenefitSelection wraps a list of chosen benefits for a proposal.
 * It also enforces rules for valid benefit combinations.
 */
export class BenefitSelection {
  constructor(
    /** Chosen benefit types for the proposal. */
    readonly benefits: BenefitType[],
  ) {
    this.validateSelection(benefits);
  }

  /**
   * Validates the benefit combination rules.
   */
  private validateSelection(benefits: BenefitType[]): void {
    if (!benefits || benefits.length === 0) {
      return;
    }

    if (benefits.includes(BenefitType.CASHBACK) && benefits.includes(BenefitType.POINTS)) {
      throw new Error('Cashback and Points cannot be selected together');
    }
  }
}

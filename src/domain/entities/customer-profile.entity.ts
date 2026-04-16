import { OfferType } from '../enums/offer-type.enum';

/**
 * CustomerProfile holds the financial and contact details for a single customer.
 */
export class CustomerProfile {
  constructor(
    /** Customer full legal name. */
    readonly fullName: string,
    /** Customer national identity document number. */
    readonly nationalId: string,
    /** Declared monthly or annual income. */
    readonly income: number,
    /** Total investments held by the customer. */
    readonly investments: number,
    /** Total years the customer has held a current account. */
    readonly currentAccountYears: number,
    /** Customer email address. */
    readonly email: string,
  ) {
    if (!fullName.trim()) {
      throw new Error('Customer full name is required');
    }
    if (!nationalId.trim()) {
      throw new Error('Customer national id is required');
    }
    if (income < 0) {
      throw new Error('Income cannot be negative');
    }
    if (investments < 0) {
      throw new Error('Investments cannot be negative');
    }
    if (currentAccountYears < 0) {
      throw new Error('Current account years cannot be negative');
    }
    if (!email.trim()) {
      throw new Error('Customer email is required');
    }
  }

  /**
   * Determines whether the customer qualifies for a specific card offer.
   * @param offer The target offer type to validate.
   * @returns true when the customer meets the financial rules for the offer.
   */
  isEligibleForOffer(offer: OfferType): boolean {
    switch (offer) {
      case OfferType.A:
        return this.income > 1000;
      case OfferType.B:
        return this.income > 15000 && this.investments > 5000;
      case OfferType.C:
        return this.income > 50000 && this.currentAccountYears > 2;
      default:
        return false;
    }
  }
}

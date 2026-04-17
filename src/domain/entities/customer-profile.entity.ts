import { OfferType } from '../enums/offer-type.enum';

/**
 * CustomerProfile representa os dados financeiros e de contato de um cliente.
 */
export class CustomerProfile {
  constructor(
    /** Nome completo do cliente. */
    readonly fullName: string,
    /** Número do documento de identificação nacional do cliente. */
    readonly nationalId: string,
    /** Renda mensal ou anual declarada. */
    readonly income: number,
    /** Total de investimentos mantidos pelo cliente. */
    readonly investments: number,
    /** Total de anos em que o cliente mantém conta corrente. */
    readonly currentAccountYears: number,
    /** Endereço de e-mail do cliente. */
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
   * Determina se o cliente é elegível para uma oferta específica de cartão.
   * @param offer Tipo de oferta que será validado.
   * @returns true quando o cliente atende às regras financeiras da oferta.
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

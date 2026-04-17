import { BenefitType } from '../enums/benefit-type.enum';

/**
 * BenefitSelection encapsula a lista de benefícios escolhidos para uma proposta.
 * Também aplica regras para combinações válidas de benefícios.
 */
export class BenefitSelection {
  constructor(
    /** Tipos de benefício escolhidos para a proposta. */
    readonly benefits: BenefitType[],
  ) {
    this.validateSelection(benefits);
  }

  /**
   * Valida as regras da combinação de benefícios.
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

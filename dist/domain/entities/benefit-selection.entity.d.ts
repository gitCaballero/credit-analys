import { BenefitType } from '../enums/benefit-type.enum';
/**
 * BenefitSelection encapsula a lista de benefícios escolhidos para uma proposta.
 * Também aplica regras para combinações válidas de benefícios.
 */
export declare class BenefitSelection {
    /** Tipos de benefício escolhidos para a proposta. */
    readonly benefits: BenefitType[];
    constructor(
    /** Tipos de benefício escolhidos para a proposta. */
    benefits: BenefitType[]);
    /**
     * Valida as regras da combinação de benefícios.
     */
    private validateSelection;
}

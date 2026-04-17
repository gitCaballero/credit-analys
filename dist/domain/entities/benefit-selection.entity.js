"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BenefitSelection = void 0;
const benefit_type_enum_1 = require("../enums/benefit-type.enum");
/**
 * BenefitSelection encapsula a lista de benefícios escolhidos para uma proposta.
 * Também aplica regras para combinações válidas de benefícios.
 */
class BenefitSelection {
    constructor(
    /** Tipos de benefício escolhidos para a proposta. */
    benefits) {
        this.benefits = benefits;
        this.validateSelection(benefits);
    }
    /**
     * Valida as regras da combinação de benefícios.
     */
    validateSelection(benefits) {
        if (!benefits || benefits.length === 0) {
            return;
        }
        if (benefits.includes(benefit_type_enum_1.BenefitType.CASHBACK) && benefits.includes(benefit_type_enum_1.BenefitType.POINTS)) {
            throw new Error('Cashback and Points cannot be selected together');
        }
    }
}
exports.BenefitSelection = BenefitSelection;

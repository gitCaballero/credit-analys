import { BenefitType } from '../../../domain/enums/benefit-type.enum';
/**
 * DTO de requisição para validar os benefícios selecionados de uma proposta existente.
 */
export declare class ValidateBenefitsDto {
    /** Lista de tipos de benefício selecionados pelo cliente. */
    selectedBenefits: BenefitType[];
}

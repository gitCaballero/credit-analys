import { IsArray, IsEnum } from 'class-validator';
import { BenefitType } from '../../../domain/enums/benefit-type.enum';

/**
 * DTO de requisição para validar os benefícios selecionados de uma proposta existente.
 */
export class ValidateBenefitsDto {
  @IsArray()
  @IsEnum(BenefitType, { each: true })
  /** Lista de tipos de benefício selecionados pelo cliente. */
  selectedBenefits!: BenefitType[];
}

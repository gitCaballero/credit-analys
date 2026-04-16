import { IsArray, IsEnum } from 'class-validator';
import { BenefitType } from '../../../domain/enums/benefit-type.enum';

/**
 * Request DTO for validating the selected benefits of an existing proposal.
 */
export class ValidateBenefitsDto {
  @IsArray()
  @IsEnum(BenefitType, { each: true })
  /** List of benefit types selected by the customer. */
  selectedBenefits!: BenefitType[];
}

import { IsArray, IsEnum } from 'class-validator';
import { BenefitType } from '../../../../domain/enums/benefit-type.enum';

export class ValidateBenefitsDto {
  @IsArray()
  @IsEnum(BenefitType, { each: true })
  selectedBenefits!: BenefitType[];
}

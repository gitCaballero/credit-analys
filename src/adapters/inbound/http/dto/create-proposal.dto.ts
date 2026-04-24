import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsString, ValidateNested, ArrayUnique, IsEmail, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { OfferType } from '../../../../domain/enums/offer-type.enum';
import { BenefitType } from '../../../../domain/enums/benefit-type.enum';

export class CustomerProfileDto {
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsString()
  @IsNotEmpty()
  nationalId!: string;

  @IsNumber()
  @Min(0)
  income!: number;

  @IsNumber()
  @Min(0)
  investments!: number;

  @IsNumber()
  @Min(0)
  currentAccountYears!: number;

  @IsEmail()
  email!: string;
}

export class CreateProposalDto {
  @IsString()
  @IsNotEmpty()
  proposalId!: string;

  @ValidateNested()
  @Type(() => CustomerProfileDto)
  customerProfile!: CustomerProfileDto;

  @IsEnum(OfferType)
  offerType!: OfferType;

  @IsArray()
  @ArrayUnique()
  @IsEnum(BenefitType, { each: true })
  selectedBenefits!: BenefitType[];
}

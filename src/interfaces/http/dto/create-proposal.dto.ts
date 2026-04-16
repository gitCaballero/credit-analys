import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsString, ValidateNested, ArrayUnique, IsEmail, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { OfferType } from '../../../domain/enums/offer-type.enum';
import { BenefitType } from '../../../domain/enums/benefit-type.enum';

/**
 * Data transfer object for customer profile data submitted in proposal creation.
 */
export class CustomerProfileDto {
  @IsString()
  @IsNotEmpty()
  /** Customer full name. */
  fullName!: string;

  @IsString()
  @IsNotEmpty()
  /** Customer national ID. */
  nationalId!: string;

  @IsNumber()
  @Min(0)
  /** Customer income amount. */
  income!: number;

  @IsNumber()
  @Min(0)
  /** Total customer investments. */
  investments!: number;

  @IsNumber()
  @Min(0)
  /** Number of years the customer has held a current account. */
  currentAccountYears!: number;

  @IsEmail()
  /** Customer email address. */
  email!: string;
}

/**
 * Request DTO for creating a new credit card proposal.
 */
export class CreateProposalDto {
  @IsString()
  @IsNotEmpty()
  /** Unique proposal identifier. */
  proposalId!: string;

  @ValidateNested()
  @Type(() => CustomerProfileDto)
  /** Customer profile payload. */
  customerProfile!: CustomerProfileDto;

  @IsEnum(OfferType)
  /** Selected offer type for this proposal. */
  offerType!: OfferType;

  @IsArray()
  @ArrayUnique()
  @IsEnum(BenefitType, { each: true })
  /** Selected benefits for the proposal. */
  selectedBenefits!: BenefitType[];
}

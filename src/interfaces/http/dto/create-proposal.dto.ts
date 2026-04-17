import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsString, ValidateNested, ArrayUnique, IsEmail, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { OfferType } from '../../../domain/enums/offer-type.enum';
import { BenefitType } from '../../../domain/enums/benefit-type.enum';

/**
 * DTO com os dados do perfil do cliente enviados na criação da proposta.
 */
export class CustomerProfileDto {
  @IsString()
  @IsNotEmpty()
  /** Nome completo do cliente. */
  fullName!: string;

  @IsString()
  @IsNotEmpty()
  /** Documento de identificação nacional do cliente. */
  nationalId!: string;

  @IsNumber()
  @Min(0)
  /** Valor da renda do cliente. */
  income!: number;

  @IsNumber()
  @Min(0)
  /** Total de investimentos do cliente. */
  investments!: number;

  @IsNumber()
  @Min(0)
  /** Quantidade de anos em que o cliente mantém conta corrente. */
  currentAccountYears!: number;

  @IsEmail()
  /** Endereço de e-mail do cliente. */
  email!: string;
}

/**
 * DTO de requisição para criar uma nova proposta de cartão de crédito.
 */
export class CreateProposalDto {
  @IsString()
  @IsNotEmpty()
  /** Identificador único da proposta. */
  proposalId!: string;

  @ValidateNested()
  @Type(() => CustomerProfileDto)
  /** Payload com os dados do perfil do cliente. */
  customerProfile!: CustomerProfileDto;

  @IsEnum(OfferType)
  /** Tipo de oferta selecionado para esta proposta. */
  offerType!: OfferType;

  @IsArray()
  @ArrayUnique()
  @IsEnum(BenefitType, { each: true })
  /** Benefícios selecionados para a proposta. */
  selectedBenefits!: BenefitType[];
}

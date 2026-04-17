import { OfferType } from '../../../domain/enums/offer-type.enum';
import { BenefitType } from '../../../domain/enums/benefit-type.enum';
/**
 * DTO com os dados do perfil do cliente enviados na criação da proposta.
 */
export declare class CustomerProfileDto {
    /** Nome completo do cliente. */
    fullName: string;
    /** Documento de identificação nacional do cliente. */
    nationalId: string;
    /** Valor da renda do cliente. */
    income: number;
    /** Total de investimentos do cliente. */
    investments: number;
    /** Quantidade de anos em que o cliente mantém conta corrente. */
    currentAccountYears: number;
    /** Endereço de e-mail do cliente. */
    email: string;
}
/**
 * DTO de requisição para criar uma nova proposta de cartão de crédito.
 */
export declare class CreateProposalDto {
    /** Identificador único da proposta. */
    proposalId: string;
    /** Payload com os dados do perfil do cliente. */
    customerProfile: CustomerProfileDto;
    /** Tipo de oferta selecionado para esta proposta. */
    offerType: OfferType;
    /** Benefícios selecionados para a proposta. */
    selectedBenefits: BenefitType[];
}

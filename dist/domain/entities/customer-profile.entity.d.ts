import { OfferType } from '../enums/offer-type.enum';
/**
 * CustomerProfile representa os dados financeiros e de contato de um cliente.
 */
export declare class CustomerProfile {
    /** Nome completo do cliente. */
    readonly fullName: string;
    /** Número do documento de identificação nacional do cliente. */
    readonly nationalId: string;
    /** Renda mensal ou anual declarada. */
    readonly income: number;
    /** Total de investimentos mantidos pelo cliente. */
    readonly investments: number;
    /** Total de anos em que o cliente mantém conta corrente. */
    readonly currentAccountYears: number;
    /** Endereço de e-mail do cliente. */
    readonly email: string;
    constructor(
    /** Nome completo do cliente. */
    fullName: string, 
    /** Número do documento de identificação nacional do cliente. */
    nationalId: string, 
    /** Renda mensal ou anual declarada. */
    income: number, 
    /** Total de investimentos mantidos pelo cliente. */
    investments: number, 
    /** Total de anos em que o cliente mantém conta corrente. */
    currentAccountYears: number, 
    /** Endereço de e-mail do cliente. */
    email: string);
    /**
     * Determina se o cliente é elegível para uma oferta específica de cartão.
     * @param offer Tipo de oferta que será validado.
     * @returns true quando o cliente atende às regras financeiras da oferta.
     */
    isEligibleForOffer(offer: OfferType): boolean;
}

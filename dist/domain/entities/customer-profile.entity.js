"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerProfile = void 0;
const offer_type_enum_1 = require("../enums/offer-type.enum");
/**
 * CustomerProfile representa os dados financeiros e de contato de um cliente.
 */
class CustomerProfile {
    constructor(
    /** Nome completo do cliente. */
    fullName, 
    /** Número do documento de identificação nacional do cliente. */
    nationalId, 
    /** Renda mensal ou anual declarada. */
    income, 
    /** Total de investimentos mantidos pelo cliente. */
    investments, 
    /** Total de anos em que o cliente mantém conta corrente. */
    currentAccountYears, 
    /** Endereço de e-mail do cliente. */
    email) {
        this.fullName = fullName;
        this.nationalId = nationalId;
        this.income = income;
        this.investments = investments;
        this.currentAccountYears = currentAccountYears;
        this.email = email;
        if (!fullName.trim()) {
            throw new Error('Customer full name is required');
        }
        if (!nationalId.trim()) {
            throw new Error('Customer national id is required');
        }
        if (income < 0) {
            throw new Error('Income cannot be negative');
        }
        if (investments < 0) {
            throw new Error('Investments cannot be negative');
        }
        if (currentAccountYears < 0) {
            throw new Error('Current account years cannot be negative');
        }
        if (!email.trim()) {
            throw new Error('Customer email is required');
        }
    }
    /**
     * Determina se o cliente é elegível para uma oferta específica de cartão.
     * @param offer Tipo de oferta que será validado.
     * @returns true quando o cliente atende às regras financeiras da oferta.
     */
    isEligibleForOffer(offer) {
        switch (offer) {
            case offer_type_enum_1.OfferType.A:
                return this.income > 1000;
            case offer_type_enum_1.OfferType.B:
                return this.income > 15000 && this.investments > 5000;
            case offer_type_enum_1.OfferType.C:
                return this.income > 50000 && this.currentAccountYears > 2;
            default:
                return false;
        }
    }
}
exports.CustomerProfile = CustomerProfile;

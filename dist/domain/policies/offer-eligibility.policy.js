"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfferEligibilityPolicy = void 0;
const offer_type_enum_1 = require("../enums/offer-type.enum");
const eligibility_result_1 = require("./eligibility-result");
class OfferEligibilityPolicy {
    evaluate(customer, selectedOffer) {
        const eligibleOffers = [];
        const rejectedRules = [];
        const reasons = [];
        Object.values(offer_type_enum_1.OfferType).forEach((offer) => {
            const valid = customer.isEligibleForOffer(offer);
            if (valid) {
                eligibleOffers.push(offer);
            }
            else {
                rejectedRules.push(`Offer ${offer} eligibility not satisfied`);
            }
        });
        const approved = selectedOffer ? eligibleOffers.includes(selectedOffer) : eligibleOffers.length > 0;
        if (selectedOffer) {
            if (approved) {
                reasons.push(`Customer is eligible for selected offer ${selectedOffer}`);
            }
            else {
                reasons.push(`Customer is not eligible for selected offer ${selectedOffer}`);
            }
        }
        else if (eligibleOffers.length > 0) {
            reasons.push(`Customer is eligible for ${eligibleOffers.join(', ')}`);
        }
        else {
            reasons.push('Customer does not meet any offer eligibility requirements');
        }
        return new eligibility_result_1.EligibilityResult(approved, reasons, rejectedRules, OfferEligibilityPolicy.POLICY_VERSION, eligibleOffers);
    }
}
exports.OfferEligibilityPolicy = OfferEligibilityPolicy;
OfferEligibilityPolicy.POLICY_VERSION = '1.0.0';

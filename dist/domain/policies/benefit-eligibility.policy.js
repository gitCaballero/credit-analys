"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BenefitEligibilityPolicy = void 0;
const benefit_type_enum_1 = require("../enums/benefit-type.enum");
const offer_type_enum_1 = require("../enums/offer-type.enum");
const eligibility_result_1 = require("./eligibility-result");
class BenefitEligibilityPolicy {
    evaluate(offer, selectedBenefits) {
        const rejectedRules = [];
        const reasons = [];
        const eligibleBenefits = [];
        if (selectedBenefits.includes(benefit_type_enum_1.BenefitType.CASHBACK) && selectedBenefits.includes(benefit_type_enum_1.BenefitType.POINTS)) {
            rejectedRules.push('Cashback and Points cannot be selected together');
        }
        selectedBenefits.forEach((benefit) => {
            switch (benefit) {
                case benefit_type_enum_1.BenefitType.CASHBACK:
                case benefit_type_enum_1.BenefitType.POINTS:
                    eligibleBenefits.push(benefit);
                    break;
                case benefit_type_enum_1.BenefitType.TRAVEL_INSURANCE:
                    if (offer === offer_type_enum_1.OfferType.C) {
                        eligibleBenefits.push(benefit);
                    }
                    else {
                        rejectedRules.push('Travel insurance is only available for offer C');
                    }
                    break;
                case benefit_type_enum_1.BenefitType.VIP_LOUNGE:
                    if (offer === offer_type_enum_1.OfferType.B || offer === offer_type_enum_1.OfferType.C) {
                        eligibleBenefits.push(benefit);
                    }
                    else {
                        rejectedRules.push('VIP lounge is only available for offers B and C');
                    }
                    break;
                default:
                    rejectedRules.push(`Unknown benefit type: ${benefit}`);
            }
        });
        if (rejectedRules.length === 0) {
            reasons.push('Selected benefits are eligible for the requested offer');
        }
        else {
            reasons.push('Some selected benefits are not eligible');
        }
        return new eligibility_result_1.EligibilityResult(rejectedRules.length === 0, reasons, rejectedRules, BenefitEligibilityPolicy.POLICY_VERSION, [], eligibleBenefits);
    }
}
exports.BenefitEligibilityPolicy = BenefitEligibilityPolicy;
BenefitEligibilityPolicy.POLICY_VERSION = '1.0.0';

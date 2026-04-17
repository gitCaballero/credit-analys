"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EligibilityResult = void 0;
class EligibilityResult {
    constructor(approved, reasons, rejectedRules, policyVersion, eligibleOffers = [], eligibleBenefits = []) {
        this.approved = approved;
        this.reasons = reasons;
        this.rejectedRules = rejectedRules;
        this.policyVersion = policyVersion;
        this.eligibleOffers = eligibleOffers;
        this.eligibleBenefits = eligibleBenefits;
    }
}
exports.EligibilityResult = EligibilityResult;

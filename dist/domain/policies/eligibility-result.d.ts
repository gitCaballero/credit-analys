import { BenefitType } from '../enums/benefit-type.enum';
import { OfferType } from '../enums/offer-type.enum';
export declare class EligibilityResult {
    readonly approved: boolean;
    readonly reasons: string[];
    readonly rejectedRules: string[];
    readonly policyVersion: string;
    readonly eligibleOffers: OfferType[];
    readonly eligibleBenefits: BenefitType[];
    constructor(approved: boolean, reasons: string[], rejectedRules: string[], policyVersion: string, eligibleOffers?: OfferType[], eligibleBenefits?: BenefitType[]);
}

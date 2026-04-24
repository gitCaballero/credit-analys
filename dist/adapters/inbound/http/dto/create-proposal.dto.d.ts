import { OfferType } from '../../../../domain/enums/offer-type.enum';
import { BenefitType } from '../../../../domain/enums/benefit-type.enum';
export declare class CustomerProfileDto {
    fullName: string;
    nationalId: string;
    income: number;
    investments: number;
    currentAccountYears: number;
    email: string;
}
export declare class CreateProposalDto {
    proposalId: string;
    customerProfile: CustomerProfileDto;
    offerType: OfferType;
    selectedBenefits: BenefitType[];
}

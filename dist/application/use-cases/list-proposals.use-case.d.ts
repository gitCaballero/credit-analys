import { ProposalRepository } from '../ports/outbound/proposal.repository.port';
export declare class ListProposalsUseCase {
    private readonly repository;
    constructor(repository: ProposalRepository);
    execute(): Promise<{
        proposalId: string;
        customerProfile: {
            fullName: string;
            nationalId: string;
            email: string;
        };
        offerType: import("../../domain/enums/offer-type.enum").OfferType;
        status: import("../../domain/enums/proposal-status.enum").ProposalStatus;
        cardCreationStatus: import("../../domain/enums/card-creation-status.enum").CardCreationStatus;
        selectedBenefits: import("../../domain/enums/benefit-type.enum").BenefitType[];
        benefitActivationStatus: Record<import("../../domain/enums/benefit-type.enum").BenefitType, import("../../domain/enums/benefit-activation-status.enum").BenefitActivationStatus>;
        rejectionReason: string | undefined;
        cardId: string | undefined;
    }[]>;
}

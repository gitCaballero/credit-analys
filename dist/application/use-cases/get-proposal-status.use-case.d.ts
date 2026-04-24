import { ProposalRepository } from '../ports/outbound/proposal.repository.port';
export declare class GetProposalStatusUseCase {
    private readonly repository;
    constructor(repository: ProposalRepository);
    execute(proposalId: string): Promise<{
        proposalId: string;
        status: import("../../domain/enums/proposal-status.enum").ProposalStatus;
        cardCreationStatus: import("../../domain/enums/card-creation-status.enum").CardCreationStatus;
        selectedBenefits: import("../../domain/enums/benefit-type.enum").BenefitType[];
        benefitActivationStatus: Record<import("../../domain/enums/benefit-type.enum").BenefitType, import("../../domain/enums/benefit-activation-status.enum").BenefitActivationStatus>;
        rejectionReason: string | undefined;
        cardId: string | undefined;
    } | null>;
}

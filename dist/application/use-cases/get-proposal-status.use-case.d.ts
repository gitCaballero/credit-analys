import { ProposalRepository } from '../ports/proposal.repository';
export declare class GetProposalStatusUseCase {
    private readonly repository;
    constructor(repository: ProposalRepository);
    execute(proposalId: string): Promise<{
        proposalId: string;
        status: import("../../domain/enums/proposal-status.enum").ProposalStatus;
        cardCreationStatus: import("../../domain/enums/card-creation-status.enum").CardCreationStatus;
        selectedBenefits: import("../../domain/enums/benefit-type.enum").BenefitType[];
        rejectionReason: string | undefined;
        cardId: string | undefined;
    } | null>;
}

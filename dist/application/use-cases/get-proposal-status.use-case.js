"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetProposalStatusUseCase = void 0;
class GetProposalStatusUseCase {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(proposalId) {
        const proposal = await this.repository.findById(proposalId);
        if (!proposal) {
            return null;
        }
        return {
            proposalId: proposal.proposalId,
            status: proposal.status,
            cardCreationStatus: proposal.cardCreationStatus,
            selectedBenefits: proposal.selectedBenefits.benefits,
            rejectionReason: proposal.rejectionReason,
            cardId: proposal.cardId,
        };
    }
}
exports.GetProposalStatusUseCase = GetProposalStatusUseCase;

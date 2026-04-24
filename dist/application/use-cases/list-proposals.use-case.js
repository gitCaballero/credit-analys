"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListProposalsUseCase = void 0;
class ListProposalsUseCase {
    constructor(repository) {
        this.repository = repository;
    }
    async execute() {
        const proposals = await this.repository.findAll();
        return proposals.map((proposal) => ({
            proposalId: proposal.proposalId,
            customerProfile: {
                fullName: proposal.customerProfile.fullName,
                nationalId: proposal.customerProfile.nationalId,
                email: proposal.customerProfile.email,
            },
            offerType: proposal.offerType,
            status: proposal.status,
            cardCreationStatus: proposal.cardCreationStatus,
            selectedBenefits: proposal.selectedBenefits.benefits,
            benefitActivationStatus: proposal.benefitActivationStatus,
            rejectionReason: proposal.rejectionReason,
            cardId: proposal.cardId,
        }));
    }
}
exports.ListProposalsUseCase = ListProposalsUseCase;

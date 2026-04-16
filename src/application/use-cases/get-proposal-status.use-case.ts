import { ProposalRepository } from '../ports/proposal.repository';

export class GetProposalStatusUseCase {
  constructor(private readonly repository: ProposalRepository) {}

  async execute(proposalId: string) {
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

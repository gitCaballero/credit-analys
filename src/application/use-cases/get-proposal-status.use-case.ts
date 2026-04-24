import { ProposalRepository } from '../ports/outbound/proposal.repository.port';

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
      benefitActivationStatus: proposal.benefitActivationStatus,
      rejectionReason: proposal.rejectionReason,
      cardId: proposal.cardId,
    };
  }
}

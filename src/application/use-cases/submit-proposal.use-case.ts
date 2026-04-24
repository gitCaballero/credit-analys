import { ProposalRepository } from '../ports/outbound/proposal.repository.port';
import { OutboxEventPublisher } from '../services/outbox-event.publisher';
import { ProposalStatus } from '../../domain/enums/proposal-status.enum';

export class SubmitProposalUseCase {
  constructor(
    private readonly repository: ProposalRepository,
    private readonly outboxPublisher: OutboxEventPublisher,
  ) {}

  async execute(proposalId: string) {
    const proposal = await this.repository.findById(proposalId);
    if (!proposal) {
      throw new Error(`Proposal ${proposalId} not found`);
    }

    if (proposal.status !== ProposalStatus.BENEFITS_VALIDATED) {
      throw new Error('Proposal must complete benefits validation before submission');
    }

    proposal.markSubmitted();
    await this.repository.save(proposal);
    await this.outboxPublisher.publish({
      eventType: 'proposal.submitted',
      aggregateId: proposal.proposalId,
      payload: {
        proposalId: proposal.proposalId,
        status: proposal.status,
      },
      occurredAt: new Date().toISOString(),
    });

    return {
      proposalId: proposal.proposalId,
      status: proposal.status,
    };
  }
}

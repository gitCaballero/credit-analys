import { CardAccountAdapter } from '../ports/card-account.adapter';
import { ProposalRepository } from '../ports/proposal.repository';
import { OutboxEventPublisher } from '../services/outbox-event.publisher';
import { ProposalStatus } from '../../domain/enums/proposal-status.enum';

export class CreateCardAccountUseCase {
  constructor(
    private readonly repository: ProposalRepository,
    private readonly adapter: CardAccountAdapter,
    private readonly outboxPublisher: OutboxEventPublisher,
  ) {}

  async execute(proposalId: string) {
    const proposal = await this.repository.findById(proposalId);
    if (!proposal) {
      throw new Error(`Proposal ${proposalId} not found`);
    }

    if (proposal.status !== ProposalStatus.SUBMITTED) {
      throw new Error('Proposal must be submitted before card account creation');
    }

    if (proposal.cardCreationStatus === 'CREATED') {
      return {
        cardId: proposal.cardId,
        status: proposal.cardCreationStatus,
      };
    }

    proposal.markCardCreationRequested();
    await this.repository.save(proposal);
    await this.outboxPublisher.publish({
      eventType: 'card.creation.requested',
      aggregateId: proposal.proposalId,
      payload: {
        proposalId: proposal.proposalId,
      },
      occurredAt: new Date().toISOString(),
    });

    const response = await this.adapter.createCardAccount({
      proposalId: proposal.proposalId,
      fullName: proposal.customerProfile.fullName,
      nationalId: proposal.customerProfile.nationalId,
      email: proposal.customerProfile.email,
      offerType: proposal.offerType,
    });

    if (response.success && response.cardId) {
      proposal.markCardCreated(response.cardId);
      await this.outboxPublisher.publish({
        eventType: 'card.created',
        aggregateId: proposal.proposalId,
        payload: {
          proposalId: proposal.proposalId,
          cardId: response.cardId,
        },
        occurredAt: new Date().toISOString(),
      });
    } else {
      proposal.markCardCreationFailed(response.reason || 'Card creation failed');
      await this.outboxPublisher.publish({
        eventType: 'card.creation.failed',
        aggregateId: proposal.proposalId,
        payload: {
          proposalId: proposal.proposalId,
          reason: response.reason,
        },
        occurredAt: new Date().toISOString(),
      });
    }

    await this.repository.save(proposal);

    return {
      cardId: proposal.cardId,
      status: proposal.cardCreationStatus,
      reason: proposal.rejectionReason,
    };
  }
}

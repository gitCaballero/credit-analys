import { CreditCardProposal } from '../../domain/entities/credit-card-proposal.entity';
import { OfferEligibilityPolicy } from '../../domain/policies/offer-eligibility.policy';
import { OutboxEventPublisher } from '../services/outbox-event.publisher';
import { ProposalRepository } from '../ports/proposal.repository';

export class ValidateOfferEligibilityUseCase {
  constructor(
    private readonly repository: ProposalRepository,
    private readonly policy: OfferEligibilityPolicy,
    private readonly outboxPublisher: OutboxEventPublisher,
  ) {}

  async execute(proposalId: string): Promise<{
    approved: boolean;
    reasons: string[];
    rejectedRules: string[];
    eligibleOffers: string[];
  }> {
    const proposal = await this.repository.findById(proposalId);
    if (!proposal) {
      throw new Error(`Proposal ${proposalId} not found`);
    }

    const result = this.policy.evaluate(proposal.customerProfile, proposal.offerType);
    if (result.approved) {
      proposal.markOfferValidated();
    } else {
      proposal.markRejected(result.reasons.join('; '));
    }

    await this.repository.save(proposal);
    await this.outboxPublisher.publish({
      eventType: 'offer.eligibility.calculated',
      aggregateId: proposal.proposalId,
      payload: {
        proposalId: proposal.proposalId,
        approved: result.approved,
        eligibleOffers: result.eligibleOffers,
        rejectedRules: result.rejectedRules,
      },
      occurredAt: new Date().toISOString(),
    });

    return {
      approved: result.approved,
      reasons: result.reasons,
      rejectedRules: result.rejectedRules,
      eligibleOffers: result.eligibleOffers,
    };
  }
}

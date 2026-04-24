import { OfferEligibilityPolicy } from '../../domain/policies/offer-eligibility.policy';
import { OutboxEventPublisher } from '../services/outbox-event.publisher';
import { ProposalRepository } from '../ports/outbound/proposal.repository.port';
export declare class ValidateOfferEligibilityUseCase {
    private readonly repository;
    private readonly policy;
    private readonly outboxPublisher;
    constructor(repository: ProposalRepository, policy: OfferEligibilityPolicy, outboxPublisher: OutboxEventPublisher);
    execute(proposalId: string): Promise<{
        approved: boolean;
        reasons: string[];
        rejectedRules: string[];
        eligibleOffers: string[];
    }>;
}

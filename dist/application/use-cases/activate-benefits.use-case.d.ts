import { BenefitType } from '../../domain/enums/benefit-type.enum';
import { BenefitsAdapter } from '../ports/benefits.adapter';
import { ProposalRepository } from '../ports/proposal.repository';
import { OutboxEventPublisher } from '../services/outbox-event.publisher';
import { BenefitActivationStatus } from '../../domain/enums/benefit-activation-status.enum';
export declare class ActivateBenefitsUseCase {
    private readonly repository;
    private readonly adapter;
    private readonly outboxPublisher;
    constructor(repository: ProposalRepository, adapter: BenefitsAdapter, outboxPublisher: OutboxEventPublisher);
    execute(proposalId: string): Promise<{
        proposalId: string;
        cardId: string | undefined;
        statuses: Record<BenefitType, BenefitActivationStatus>;
        completed: boolean;
    }>;
}

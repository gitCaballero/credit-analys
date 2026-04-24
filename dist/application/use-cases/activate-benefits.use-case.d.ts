import { BenefitType } from '../../domain/enums/benefit-type.enum';
import { BenefitsPort } from '../ports/outbound/benefits.port';
import { ProposalRepository } from '../ports/outbound/proposal.repository.port';
import { OutboxEventPublisher } from '../services/outbox-event.publisher';
import { BenefitActivationStatus } from '../../domain/enums/benefit-activation-status.enum';
export declare class ActivateBenefitsUseCase {
    private readonly repository;
    private readonly benefitsPort;
    private readonly outboxPublisher;
    constructor(repository: ProposalRepository, benefitsPort: BenefitsPort, outboxPublisher: OutboxEventPublisher);
    execute(proposalId: string): Promise<{
        proposalId: string;
        cardId: string | undefined;
        statuses: Record<BenefitType, BenefitActivationStatus>;
        completed: boolean;
    }>;
}

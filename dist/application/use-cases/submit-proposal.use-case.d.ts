import { ProposalRepository } from '../ports/proposal.repository';
import { OutboxEventPublisher } from '../services/outbox-event.publisher';
import { ProposalStatus } from '../../domain/enums/proposal-status.enum';
export declare class SubmitProposalUseCase {
    private readonly repository;
    private readonly outboxPublisher;
    constructor(repository: ProposalRepository, outboxPublisher: OutboxEventPublisher);
    execute(proposalId: string): Promise<{
        proposalId: string;
        status: ProposalStatus.BENEFITS_VALIDATED;
    }>;
}

import { CardAccountAdapter } from '../ports/card-account.adapter';
import { ProposalRepository } from '../ports/proposal.repository';
import { OutboxEventPublisher } from '../services/outbox-event.publisher';
export declare class CreateCardAccountUseCase {
    private readonly repository;
    private readonly adapter;
    private readonly outboxPublisher;
    constructor(repository: ProposalRepository, adapter: CardAccountAdapter, outboxPublisher: OutboxEventPublisher);
    execute(proposalId: string): Promise<{
        cardId: string | undefined;
        status: import("../../domain/enums/card-creation-status.enum").CardCreationStatus.CREATED;
        reason?: undefined;
    } | {
        cardId: string | undefined;
        status: import("../../domain/enums/card-creation-status.enum").CardCreationStatus.NOT_CREATED | import("../../domain/enums/card-creation-status.enum").CardCreationStatus.REQUESTED | import("../../domain/enums/card-creation-status.enum").CardCreationStatus.FAILED;
        reason: string | undefined;
    }>;
}

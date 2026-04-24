import { CardAccountPort } from '../ports/outbound/card-account.port';
import { ProposalRepository } from '../ports/outbound/proposal.repository.port';
import { OutboxEventPublisher } from '../services/outbox-event.publisher';
export declare class CreateCardAccountUseCase {
    private readonly repository;
    private readonly cardAccountPort;
    private readonly outboxPublisher;
    constructor(repository: ProposalRepository, cardAccountPort: CardAccountPort, outboxPublisher: OutboxEventPublisher);
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

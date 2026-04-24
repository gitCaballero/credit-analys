import { DomainEvent } from '../../domain/events/domain-event';
import { OutboxEventRepository } from '../ports/outbound/outbox-event.repository.port';
export declare class OutboxEventPublisher {
    private readonly repository;
    constructor(repository: OutboxEventRepository);
    publish(event: DomainEvent): Promise<void>;
}

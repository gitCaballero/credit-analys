import { DomainEvent } from '../../domain/events/domain-event';
import { OutboxEventRepository } from '../ports/outbox-event.repository';
export declare class OutboxEventPublisher {
    private readonly repository;
    constructor(repository: OutboxEventRepository);
    publish(event: DomainEvent): Promise<void>;
}

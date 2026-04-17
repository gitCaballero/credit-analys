import { DomainEvent } from '../../domain/events/domain-event';
export interface OutboxEventRepository {
    save(event: DomainEvent): Promise<void>;
}

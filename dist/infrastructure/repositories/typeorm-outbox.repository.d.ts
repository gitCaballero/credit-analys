import { Repository } from 'typeorm';
import { DomainEvent } from '../../domain/events/domain-event';
import { OutboxEventEntity } from '../typeorm/entities/outbox-event.entity';
import { OutboxEventRepository } from '../../application/ports/outbox-event.repository';
export declare class TypeormOutboxRepository implements OutboxEventRepository {
    private readonly repository;
    constructor(repository: Repository<OutboxEventEntity>);
    save(event: DomainEvent): Promise<void>;
}

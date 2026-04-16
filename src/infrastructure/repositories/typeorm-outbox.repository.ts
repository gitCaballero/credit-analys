import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DomainEvent } from '../../domain/events/domain-event';
import { OutboxEventEntity } from '../typeorm/entities/outbox-event.entity';
import { OutboxEventRepository } from '../../application/ports/outbox-event.repository';

@Injectable()
export class TypeormOutboxRepository implements OutboxEventRepository {
  constructor(
    @InjectRepository(OutboxEventEntity)
    private readonly repository: Repository<OutboxEventEntity>,
  ) {}

  async save(event: DomainEvent): Promise<void> {
    const entity = new OutboxEventEntity();
    entity.eventType = event.eventType;
    entity.payload = event.payload;
    entity.aggregateId = event.aggregateId;
    entity.status = 'pending';
    await this.repository.save(entity);
  }
}

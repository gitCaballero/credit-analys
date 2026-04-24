import { Inject, Injectable } from '@nestjs/common';
import { DomainEvent } from '../../domain/events/domain-event';
import { OutboxEventRepository } from '../ports/outbound/outbox-event.repository.port';

@Injectable()
export class OutboxEventPublisher {
  constructor(
    @Inject('OutboxEventRepositoryPort')
    private readonly repository: OutboxEventRepository,
  ) {}

  async publish(event: DomainEvent): Promise<void> {
    await this.repository.save(event);
  }
}

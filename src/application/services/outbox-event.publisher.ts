import { Inject, Injectable } from '@nestjs/common';
import { DomainEvent } from '../../domain/events/domain-event';
import { OutboxEventRepository } from '../ports/outbox-event.repository';

@Injectable()
export class OutboxEventPublisher {
  constructor(
    @Inject('OutboxEventRepository')
    private readonly repository: OutboxEventRepository,
  ) {}

  async publish(event: DomainEvent): Promise<void> {
    await this.repository.save(event);
  }
}

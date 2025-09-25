import { Injectable, Logger } from '@nestjs/common';
import { QueueService } from '../../queue/queue.service';
import { DomainEventPublisher } from '../../domain/ports/domain-event-publisher.port';
import { DomainEvent } from '../../domain/domain-events/domain-event';

@Injectable()
export class QueueEventPublisher implements DomainEventPublisher {
  private readonly logger = new Logger(QueueEventPublisher.name);

  constructor(private readonly queueService: QueueService) {}

  async publish(event: DomainEvent): Promise<void> {
    this.logger.log(`Publicando evento: ${event.getEventName()}`);

    await this.queueService.addEmailJob({
      eventType: event.getEventName(),
      eventData: event,
    });
  }

  async publishAll(events: DomainEvent[]): Promise<void> {
    this.logger.log(`Publicando ${events.length} eventos em paralelo`);

    // Processamento paralelo para performance
    await Promise.all(events.map((event) => this.publish(event)));
  }
}

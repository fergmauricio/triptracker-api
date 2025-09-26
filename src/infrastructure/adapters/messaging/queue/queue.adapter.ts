import { Injectable, Logger } from '@nestjs/common';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';

import { DomainEvent } from '../../../../domain/domain-events/domain-event';
import { DomainEventPublisher } from '@application/index';

@Injectable()
export class QueueAdapter implements DomainEventPublisher {
  private readonly logger = new Logger(QueueAdapter.name);

  constructor(private rabbitMQService: RabbitMQService) {}

  async publish(event: DomainEvent): Promise<void> {
    try {
      this.logger.log(`Publicando evento: ${event.getEventName()}`);

      const eventData = this.serializeEvent(event);

      await this.rabbitMQService.publishToExchange(
        'domain_events',
        'email_event',
        eventData,
      );

      this.logger.log(`Evento publicado: ${event.getEventName()}`);
    } catch (error) {
      this.logger.error(
        `Erro ao publicar evento ${event.getEventName()}:`,
        error,
      );
      throw error;
    }
  }

  async publishAll(events: DomainEvent[]): Promise<void> {
    this.logger.log(`Publicando ${events.length} eventos em paralelo`);

    await Promise.all(events.map((event) => this.publish(event)));
  }

  private serializeEvent(event: DomainEvent): any {
    if (typeof (event as any).serialize === 'function') {
      return (event as any).serialize();
    }

    const eventData = { ...(event as any) };

    if (eventData.email && typeof eventData.email.getValue === 'function') {
      eventData.email = eventData.email.getValue();
    }

    if (eventData.userId && typeof eventData.userId.getValue === 'function') {
      eventData.userId = eventData.userId.getValue();
    }

    return {
      eventType: event.getEventName(),
      eventData: eventData,
    };
  }
}

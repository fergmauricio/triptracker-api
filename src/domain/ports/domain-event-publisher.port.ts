import { DomainEvent } from '../domain-events/domain-event';

export interface DomainEventPublisher {
  publish(event: DomainEvent): Promise<void>;
  publishAll(events: DomainEvent[]): Promise<void>;
}

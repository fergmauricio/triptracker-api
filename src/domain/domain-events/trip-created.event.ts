import { DomainEvent } from './domain-event';

export class TripCreatedEvent implements DomainEvent {
  public readonly occurredOn: Date;

  constructor(
    public readonly tripId: number,
    public readonly title: string,
    public readonly userId: number,
  ) {
    this.occurredOn = new Date();
  }

  getEventName(): string {
    return 'TripCreatedEvent';
  }
}

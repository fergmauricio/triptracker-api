import { DomainEvent } from './domain-event';

export class UserRegisteredEvent implements DomainEvent {
  public readonly occurredOn: Date;

  constructor(
    public readonly email: string,
    public readonly name: string,
  ) {
    this.occurredOn = new Date();
  }

  getEventName(): string {
    return 'UserRegisteredEvent';
  }
}

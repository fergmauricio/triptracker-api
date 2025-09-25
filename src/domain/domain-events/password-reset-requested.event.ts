import { DomainEvent } from './domain-event';

export class PasswordResetRequestedEvent implements DomainEvent {
  public readonly occurredOn: Date = new Date();

  constructor(
    public readonly email: string,
    public readonly token: string,
    public readonly userName: string,
  ) {}

  getEventName(): string {
    return 'PasswordResetRequestedEvent';
  }
}

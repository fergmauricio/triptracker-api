import { DomainEvent } from './domain-event';

export class AvatarUploadedEvent implements DomainEvent {
  public readonly occurredOn: Date = new Date();

  constructor(
    public readonly userId: string,
    public readonly fileKey: string,
    public readonly fileUrl: string,
  ) {}

  getEventName(): string {
    return 'AvatarUploadedEvent';
  }

  serialize(): any {
    return {
      eventType: this.getEventName(),
      eventData: {
        userId: this.userId,
        fileKey: this.fileKey,
        fileUrl: this.fileUrl,
        occurredOn: this.occurredOn.toISOString(),
      },
    };
  }
}

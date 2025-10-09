import { DomainEvent } from './domain-event';

export class FileUploadedEvent implements DomainEvent {
  public readonly occurredOn: Date = new Date();

  constructor(
    public readonly fileKey: string,
    public readonly fileUrl: string,
    public readonly category: string,
    public readonly entityId?: string,
  ) {}

  getEventName(): string {
    return 'FileUploadedEvent';
  }

  serialize(): any {
    return {
      eventType: this.getEventName(),
      eventData: {
        fileKey: this.fileKey,
        fileUrl: this.fileUrl,
        category: this.category,
        entityId: this.entityId,
        occurredOn: this.occurredOn.toISOString(),
      },
    };
  }
}

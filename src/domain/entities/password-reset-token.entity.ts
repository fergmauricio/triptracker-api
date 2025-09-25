import { UserId } from '../value-objects/user-id.vo';
import { DomainEvent } from '../domain-events/domain-event';

export class PasswordResetToken {
  private id: number;
  private token: string;
  private userId: UserId;
  private expiresAt: Date;
  private createdAt: Date;
  private domainEvents: DomainEvent[] = [];

  constructor(
    id: number,
    token: string,
    userId: UserId,
    expiresAt: Date,
    createdAt: Date = new Date(),
  ) {
    this.id = id;
    this.token = token;
    this.userId = userId;
    this.expiresAt = expiresAt;
    this.createdAt = createdAt;
  }

  static create(
    userId: UserId,
    expiresInHours: number = 1,
  ): PasswordResetToken {
    const token = this.generateRandomToken();
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    return new PasswordResetToken(0, token, userId, expiresAt);
  }

  private static generateRandomToken(): string {
    return require('crypto').randomBytes(32).toString('hex');
  }

  isValid(): boolean {
    return this.expiresAt > new Date();
  }

  isExpired(): boolean {
    return !this.isValid();
  }

  belongsToUser(userId: UserId): boolean {
    return this.userId.equals(userId);
  }

  addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  getDomainEvents(): DomainEvent[] {
    return [...this.domainEvents];
  }

  clearDomainEvents(): void {
    this.domainEvents = [];
  }

  // Getters
  getId(): number {
    return this.id;
  }

  getToken(): string {
    return this.token;
  }

  getUserId(): UserId {
    return this.userId;
  }

  getExpiresAt(): Date {
    return this.expiresAt;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }
}

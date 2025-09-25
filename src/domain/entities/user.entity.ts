import { Email } from '../value-objects/email.vo';
import { UserId } from '../value-objects/user-id.vo';
import { PasswordHash } from '../value-objects/password-hash.vo';
import { DomainEvent } from '../domain-events/domain-event';
import { UserRegisteredEvent } from '../domain-events/user-registered.event';

export class User {
  private id: UserId;
  private name: string;
  private email: Email;
  private password: PasswordHash;
  private active: boolean;
  private domainEvents: DomainEvent[] = [];

  private constructor(
    id: UserId,
    name: string,
    email: Email,
    password: PasswordHash,
    active: boolean = true,
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.active = active;
  }

  static async create(
    name: string,
    email: Email,
    plainPassword: string,
  ): Promise<User> {
    if (!name || name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }

    const password = await PasswordHash.create(plainPassword);
    const user = new User(new UserId(0), name.trim(), email, password, true);

    console.log('[DEBUG] Adicionando UserRegisteredEvent ao usuário');
    user.addDomainEvent(new UserRegisteredEvent(email.getValue(), name));
    console.log(
      '[DEBUG] Usuário domain events:',
      user.getDomainEvents().length,
    );

    return user;
  }

  static fromPersistence(
    id: number,
    name: string,
    email: string,
    passwordHash: string,
    active: boolean,
  ): User {
    return new User(
      new UserId(id),
      name,
      new Email(email),
      PasswordHash.fromHash(passwordHash),
      active,
    );
  }

  changeName(name: string): void {
    if (!name || name.trim().length < 2) {
      throw new Error('O Nome precisa ter no mínimo 2 caracteres');
    }
    this.name = name.trim();
  }

  changeEmail(email: Email): void {
    this.email = email;
  }

  async changePassword(
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    const isCurrentPasswordValid = await this.password.verify(oldPassword);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    this.password = await PasswordHash.create(newPassword);
  }

  deactivate(): void {
    this.active = false;
  }

  activate(): void {
    this.active = true;
  }

  // Domain Events
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
  getId(): UserId {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getEmail(): Email {
    return this.email;
  }

  getPasswordHash(): string {
    return this.password.getValue();
  }

  isActive(): boolean {
    return this.active;
  }

  async verifyPassword(plainPassword: string): Promise<boolean> {
    return await this.password.verify(plainPassword);
  }
}

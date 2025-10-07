import { DomainEvent } from '../domain-events/domain-event';
import { TripCreatedEvent } from '../domain-events/trip-created.event';
import { TripId } from '../value-objects/trip-id.vo';
import { UserId } from '../value-objects/user-id.vo';

export class Trip {
  private id: TripId;
  private title: string;
  private description: string | null;
  private thumb: string | null;
  private startDate: Date | null;
  private endDate: Date | null;
  private userId: UserId;
  private createdAt: Date;
  private updatedAt: Date | null;
  private domainEvents: DomainEvent[] = [];

  private constructor(
    id: TripId,
    title: string,
    description: string | null,
    thumb: string | null,
    startDate: Date | null,
    endDate: Date | null,
    userId: UserId,
    createdAt: Date,
    updatedAt: Date | null,
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.thumb = thumb;
    this.startDate = startDate;
    this.endDate = endDate;
    this.userId = userId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(
    title: string,
    description: string | null,
    thumb: string | null,
    startDate: Date | null,
    endDate: Date | null,
    userId: UserId,
  ): Trip {
    if (!title || title.trim().length < 1) {
      throw new Error('TÍTULO_VIAGEM_VAZIO');
    }

    if (title.length > 100) {
      throw new Error('TÍTULO_VIAGEM_MUITO_LONGO');
    }

    if (description && description.length > 500) {
      throw new Error('DESCRIÇÃO_VIAGEM_MUITO_LONGA');
    }

    // Validar intervalo de datas
    if (startDate && endDate && startDate > endDate) {
      throw new Error('DATA_INICIO_MAIOR_DATA_FIM');
    }

    const trip = new Trip(
      new TripId(0),
      title.trim(),
      description?.trim() || null,
      thumb || null,
      startDate,
      endDate,
      userId,
      new Date(),
      null,
    );

    trip.addDomainEvent(
      new TripCreatedEvent(trip.id.getValue(), title, userId.getValue()),
    );

    return trip;
  }

  static fromPersistence(
    id: number,
    title: string,
    description: string | null,
    thumb: string | null,
    startDate: Date | null,
    endDate: Date | null,
    userId: number,
    createdAt: Date,
    updatedAt: Date | null,
  ): Trip {
    return new Trip(
      new TripId(id),
      title,
      description,
      thumb,
      startDate,
      endDate,
      new UserId(userId),
      createdAt,
      updatedAt,
    );
  }

  update(
    title?: string,
    description?: string | null,
    thumb?: string | null,
    startDate?: Date | null,
    endDate?: Date | null,
  ): void {
    if (title !== undefined) {
      if (!title.trim()) {
        throw new Error('TÍTULO_VIAGEM_VAZIO');
      }
      if (title.length > 100) {
        throw new Error('TÍTULO_VIAGEM_MUITO_LONGO');
      }
      this.title = title.trim();
    }

    if (description !== undefined) {
      if (description && description.length > 500) {
        throw new Error('DESCRIÇÃO_VIAGEM_MUITO_LONGA');
      }
      this.description = description?.trim() || null;
    }

    if (thumb !== undefined) {
      this.thumb = thumb;
    }

    if (startDate !== undefined) {
      this.startDate = startDate;
    }

    if (endDate !== undefined) {
      this.endDate = endDate;
    }

    // Validar intervalo de datas
    if (this.startDate && this.endDate && this.startDate > this.endDate) {
      throw new Error('DATA_INICIO_MAIOR_DATA_FIM');
    }

    this.updatedAt = new Date();
  }

  updateId(newId: number): void {
    this.id = new TripId(newId);
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
  getId(): TripId {
    return this.id;
  }

  getTitle(): string {
    return this.title;
  }

  getDescription(): string | null {
    return this.description;
  }

  getThumb(): string | null {
    return this.thumb;
  }

  getStartDate(): Date | null {
    return this.startDate;
  }

  getEndDate(): Date | null {
    return this.endDate;
  }

  getUserId(): UserId {
    return this.userId;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date | null {
    return this.updatedAt;
  }
}

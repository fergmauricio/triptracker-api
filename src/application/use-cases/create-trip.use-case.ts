import { Trip } from '../../domain/entities/trip.entity';
import { UserId } from '../../domain/value-objects/user-id.vo';
import type { DomainEventPublisher } from '../../domain/ports/domain-event-publisher.port';
import type { ITripRepository } from '@domain/ports/trip-repository.port';
import { CreateTripCommand } from '@application/commands/create-trip-command';
import { StructuredLoggerService } from '@infrastructure/adapters/external/logging/structured-logger.service';

export class CreateTripUseCase {
  constructor(
    private readonly tripRepository: ITripRepository,
    private readonly eventPublisher: DomainEventPublisher,
    private readonly logger: StructuredLoggerService,
  ) {}

  async execute(command: CreateTripCommand): Promise<{ tripId: number }> {
    this.logger.log('Inicializando CreateTripUseCase', 'CreateTripUseCase', {
      title: command.title,
      userId: command.userId,
    });

    try {
      const userId = new UserId(command.userId);

      const trip = await Trip.create(
        command.title,
        command.description,
        command.thumb,
        command.startDate,
        command.endDate,
        userId,
      );

      await this.tripRepository.save(trip);

      this.logger.log('Viagem criada com sucesso', 'CreateTripUseCase', {
        tripId: trip.getId().getValue(),
        userId: command.userId,
      });

      // Publicar eventos de domínio
      const events = trip.getDomainEvents();
      if (events.length > 0 && this.eventPublisher) {
        for (const event of events) {
          await this.eventPublisher.publish(event);
          this.logger.log('Evento de viagem publicado', 'CreateTripUseCase', {
            eventType: event.getEventName(),
            tripId: trip.getId().getValue(),
          });
        }
        trip.clearDomainEvents();
      }

      return {
        tripId: trip.getId().getValue(),
      };
    } catch (error) {
      this.logger.error(
        'Falha ao criar viagem',
        error.stack,
        'CreateTripUseCase',
        {
          title: command.title,
          userId: command.userId,
          error: error.message,
        },
      );
      throw error;
    }
  }
}

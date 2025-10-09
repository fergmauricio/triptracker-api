import { Trip } from '../../domain/entities/trip.entity';
import { UserId } from '../../domain/value-objects/user-id.vo';
import type { DomainEventPublisher } from '../../domain/ports/domain-event-publisher.port';
import type { ITripRepository } from '@domain/ports/trip-repository.port';
import { CreateTripCommand } from '@application/commands/create-trip-command';
import { StructuredLoggerService } from '@infrastructure/adapters/external/logging/structured-logger.service';
import { FileStorage } from '@domain/ports/file-storage.port';
import { FileKey } from '@domain/value-objects/file-key.vo';

export class CreateTripUseCase {
  constructor(
    private readonly tripRepository: ITripRepository,
    private readonly eventPublisher: DomainEventPublisher,
    private readonly fileStorage: FileStorage,
    private readonly logger: StructuredLoggerService,
  ) {}

  async execute(
    command: CreateTripCommand,
  ): Promise<{ tripId: number; thumbUrl?: string }> {
    this.logger.log('Inicializando CreateTripUseCase', 'CreateTripUseCase', {
      title: command.title,
      userId: command.userId,
      hasThumbFile: !!command.thumbFile,
    });

    try {
      let thumbKey: string | null = null;
      let thumbUrl: string | null = null;

      if (command.thumbFile) {
        this.logger.log('Processando upload da thumb', 'CreateTripUseCase');

        const fileKey = FileKey.create('trips', command.thumbFile.originalname);

        thumbUrl = await this.fileStorage.uploadFile(
          command.thumbFile.buffer,
          fileKey.getValue(),
          command.thumbFile.mimetype,
        );
        thumbKey = fileKey.getValue();

        this.logger.log('Upload da thumb concluído', 'CreateTripUseCase', {
          thumbKey,
          thumbUrl,
        });
      }

      const userId = new UserId(command.userId);
      const trip = await Trip.create(
        command.title,
        command.description,
        thumbKey, // Pode ser null
        command.startDate,
        command.endDate,
        userId,
      );

      await this.tripRepository.save(trip);

      this.logger.log('Viagem criada com sucesso', 'CreateTripUseCase', {
        tripId: trip.getId().getValue(),
        userId: command.userId,
        hasThumb: !!thumbKey,
      });

      const events = trip.getDomainEvents();
      if (events.length > 0 && this.eventPublisher) {
        for (const event of events) {
          await this.eventPublisher.publish(event);
        }
        trip.clearDomainEvents();
      }

      return {
        tripId: trip.getId().getValue(),
        thumbUrl: thumbUrl || undefined,
      };
    } catch (error) {
      this.logger.error(
        'Falha ao criar viagem',
        error.stack,
        'CreateTripUseCase',
      );
      throw error;
    }
  }
}

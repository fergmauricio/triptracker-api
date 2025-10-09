import { FileStorage } from '@domain/ports/file-storage.port';
import { TripId } from '../../domain/value-objects/trip-id.vo';
import type { ITripRepository } from '@domain/ports/trip-repository.port';
import { StructuredLoggerService } from '@infrastructure/adapters/external/logging/structured-logger.service';

export class GetTripUseCase {
  constructor(
    private readonly tripRepository: ITripRepository,
    private readonly fileStorage: FileStorage,

    private readonly logger: StructuredLoggerService,
  ) {}

  private isFileKey(thumb: string): boolean {
    return (
      thumb.startsWith('avatars/') ||
      thumb.startsWith('trips/') ||
      thumb.startsWith('cards/') ||
      thumb.startsWith('maps/')
    );
  }

  async execute(tripId: number, userId: number): Promise<any> {
    this.logger.log('Inicializando GetTripUseCase', 'GetTripUseCase', {
      tripId,
      userId,
    });

    try {
      const trip = await this.tripRepository.findById(new TripId(tripId));

      if (!trip) {
        this.logger.warn('Viagem não encontrada', 'GetTripUseCase', {
          tripId,
          userId,
        });
        throw new Error('VIAGEM_NAO_ENCONTRADA');
      }

      if (trip.getUserId().getValue() !== userId) {
        this.logger.warn('Acesso negado à viagem', 'GetTripUseCase', {
          tripId,
          userId,
          tripUserId: trip.getUserId().getValue(),
        });
        throw new Error('ACESSO_NEGADO_VIAGEM');
      }

      this.logger.log('Viagem recuperada com sucesso', 'GetTripUseCase', {
        tripId,
        userId,
      });

      const tripData = {
        id: trip.getId().getValue(),
        title: trip.getTitle(),
        description: trip.getDescription(),
        thumb: trip.getThumb(),
        startDate: trip.getStartDate(),
        endDate: trip.getEndDate(),
        userId: trip.getUserId().getValue(),
        createdAt: trip.getCreatedAt(),
        updatedAt: trip.getUpdatedAt(),
      };

      if (tripData.thumb && this.isFileKey(tripData.thumb)) {
        tripData.thumb = await this.fileStorage.getSignedUrl(
          tripData.thumb,
          3600,
        );
      }

      return tripData;
    } catch (error) {
      this.logger.error(
        'Falha ao recuperar viagem',
        error.stack,
        'GetTripUseCase',
        {
          tripId,
          userId,
          error: error.message,
        },
      );
      throw error;
    }
  }
}

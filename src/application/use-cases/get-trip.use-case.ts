import { TripId } from '../../domain/value-objects/trip-id.vo';
import type { ITripRepository } from '@domain/ports/trip-repository.port';
import { StructuredLoggerService } from '@infrastructure/adapters/external/logging/structured-logger.service';

export class GetTripUseCase {
  constructor(
    private readonly tripRepository: ITripRepository,
    private readonly logger: StructuredLoggerService,
  ) {}

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

      return {
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

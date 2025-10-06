import { TripId } from '../../domain/value-objects/trip-id.vo';
import type { ITripRepository } from '@domain/ports/trip-repository.port';
import { StructuredLoggerService } from '@infrastructure/adapters/external/logging/structured-logger.service';

export class DeleteTripUseCase {
  constructor(
    private readonly tripRepository: ITripRepository,
    private readonly logger: StructuredLoggerService,
  ) {}

  async execute(tripId: number, userId: number): Promise<void> {
    this.logger.log('Inicializando DeleteTripUseCase', 'DeleteTripUseCase', {
      tripId,
      userId,
    });

    try {
      const trip = await this.tripRepository.findById(new TripId(tripId));

      if (!trip) {
        this.logger.warn(
          'Viagem não encontrada para exclusão',
          'DeleteTripUseCase',
          {
            tripId,
            userId,
          },
        );
        throw new Error('VIAGEM_NAO_ENCONTRADA');
      }

      if (trip.getUserId().getValue() !== userId) {
        this.logger.warn(
          'Acesso negado para excluir viagem',
          'DeleteTripUseCase',
          {
            tripId,
            userId,
            tripUserId: trip.getUserId().getValue(),
          },
        );
        throw new Error('ACESSO_NEGADO_VIAGEM');
      }

      await this.tripRepository.delete(new TripId(tripId));

      this.logger.log('Viagem excluída com sucesso', 'DeleteTripUseCase', {
        tripId,
        userId,
      });
    } catch (error) {
      this.logger.error(
        'Falha ao excluir viagem',
        error.stack,
        'DeleteTripUseCase',
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

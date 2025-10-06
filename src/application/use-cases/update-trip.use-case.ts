import { TripId } from '../../domain/value-objects/trip-id.vo';
import type { ITripRepository } from '@domain/ports/trip-repository.port';
import { UpdateTripCommand } from '@application/commands/update-trip-command';
import { StructuredLoggerService } from '@infrastructure/adapters/external/logging/structured-logger.service';

export class UpdateTripUseCase {
  constructor(
    private readonly tripRepository: ITripRepository,
    private readonly logger: StructuredLoggerService,
  ) {}

  async execute(command: UpdateTripCommand): Promise<void> {
    this.logger.log('Inicializando UpdateTripUseCase', 'UpdateTripUseCase', {
      tripId: command.tripId,
      userId: command.userId,
    });

    try {
      const trip = await this.tripRepository.findById(
        new TripId(command.tripId),
      );

      if (!trip) {
        this.logger.warn(
          'Viagem não encontrada para atualização',
          'UpdateTripUseCase',
          {
            tripId: command.tripId,
            userId: command.userId,
          },
        );
        throw new Error('VIAGEM_NAO_ENCONTRADA');
      }

      if (trip.getUserId().getValue() !== command.userId) {
        this.logger.warn(
          'Acesso negado para atualizar viagem',
          'UpdateTripUseCase',
          {
            tripId: command.tripId,
            userId: command.userId,
            tripUserId: trip.getUserId().getValue(),
          },
        );
        throw new Error('ACESSO_NEGADO_VIAGEM');
      }

      trip.update(
        command.title,
        command.description,
        command.thumb,
        command.startDate,
        command.endDate,
      );

      await this.tripRepository.update(trip);

      this.logger.log('Viagem atualizada com sucesso', 'UpdateTripUseCase', {
        tripId: command.tripId,
        userId: command.userId,
      });
    } catch (error) {
      this.logger.error(
        'Falha ao atualizar viagem',
        error.stack,
        'UpdateTripUseCase',
        {
          tripId: command.tripId,
          userId: command.userId,
          error: error.message,
        },
      );
      throw error;
    }
  }
}

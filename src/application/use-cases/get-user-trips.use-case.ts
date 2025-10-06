import { UserId } from '../../domain/value-objects/user-id.vo';
import type { ITripRepository } from '@domain/ports/trip-repository.port';
import { StructuredLoggerService } from '@infrastructure/adapters/external/logging/structured-logger.service';

export class GetUserTripsUseCase {
  constructor(
    private readonly tripRepository: ITripRepository,
    private readonly logger: StructuredLoggerService,
  ) {}

  async execute(userId: number): Promise<any[]> {
    this.logger.log(
      'Inicializando GetUserTripsUseCase',
      'GetUserTripsUseCase',
      {
        userId,
      },
    );

    try {
      const trips = await this.tripRepository.findByUserId(new UserId(userId));

      this.logger.log('Viagens do usuário recuperadas', 'GetUserTripsUseCase', {
        userId,
        totalTrips: trips.length,
      });

      return trips.map((trip) => ({
        id: trip.getId().getValue(),
        title: trip.getTitle(),
        description: trip.getDescription(),
        thumb: trip.getThumb(),
        startDate: trip.getStartDate(),
        endDate: trip.getEndDate(),
        userId: trip.getUserId().getValue(),
        createdAt: trip.getCreatedAt(),
        updatedAt: trip.getUpdatedAt(),
      }));
    } catch (error) {
      this.logger.error(
        'Falha ao recuperar viagens do usuário',
        error.stack,
        'GetUserTripsUseCase',
        {
          userId,
          error: error.message,
        },
      );
      throw error;
    }
  }
}

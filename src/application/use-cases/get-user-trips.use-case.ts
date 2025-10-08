import { FileStorage } from '@domain/ports/file-storage.port';
import { UserId } from '../../domain/value-objects/user-id.vo';
import type { ITripRepository } from '@domain/ports/trip-repository.port';
import { StructuredLoggerService } from '@infrastructure/adapters/external/logging/structured-logger.service';

export class GetUserTripsUseCase {
  constructor(
    private readonly tripRepository: ITripRepository,
    private readonly fileStorage: FileStorage,

    private readonly logger: StructuredLoggerService,
  ) {}
  async execute(userId: number): Promise<any[]> {
    const trips = await this.tripRepository.findByUserId(new UserId(userId));

    const tripsWithSignedUrls = await Promise.all(
      trips.map(async (trip) => {
        let thumb = trip.getThumb();

        if (thumb && this.isFileKey(thumb)) {
          thumb = await this.fileStorage.getSignedUrl(thumb, 3600);
        }

        return {
          id: trip.getId().getValue(),
          title: trip.getTitle(),
          description: trip.getDescription(),
          thumb,
          startDate: trip.getStartDate(),
          endDate: trip.getEndDate(),
          userId: trip.getUserId().getValue(),
          createdAt: trip.getCreatedAt(),
          updatedAt: trip.getUpdatedAt(),
        };
      }),
    );

    return tripsWithSignedUrls;
  }

  private isFileKey(thumb: string): boolean {
    return (
      thumb.startsWith('avatar/') ||
      thumb.startsWith('trip/') ||
      thumb.startsWith('card/') ||
      thumb.startsWith('map/')
    );
  }
}

import { Provider } from '@nestjs/common';
import {
  CreateTripUseCase,
  GetTripUseCase,
  UpdateTripUseCase,
  DeleteTripUseCase,
  GetUserTripsUseCase,
} from '../use-cases';
import { fileStorageProviders } from './file-storage.providers';

export const tripProviders: Provider[] = [
  {
    provide: CreateTripUseCase,
    useFactory: (tripRepository, eventPublisher, logger) =>
      new CreateTripUseCase(tripRepository, eventPublisher, logger),
    inject: ['TRIP_REPOSITORY', 'DOMAIN_EVENT_PUBLISHER', 'STRUCTURED_LOGGER'],
  },
  {
    provide: GetTripUseCase,
    useFactory: (tripRepository, fileStorage, logger) =>
      new GetTripUseCase(tripRepository, fileStorage, logger),
    inject: ['TRIP_REPOSITORY', 'FILE_STORAGE', 'STRUCTURED_LOGGER'],
  },
  {
    provide: UpdateTripUseCase,
    useFactory: (tripRepository, logger) =>
      new UpdateTripUseCase(tripRepository, logger),
    inject: ['TRIP_REPOSITORY', 'STRUCTURED_LOGGER'],
  },
  {
    provide: DeleteTripUseCase,
    useFactory: (tripRepository, logger) =>
      new DeleteTripUseCase(tripRepository, logger),
    inject: ['TRIP_REPOSITORY', 'STRUCTURED_LOGGER'],
  },
  {
    provide: GetUserTripsUseCase,
    useFactory: (tripRepository, fileStorage, logger) =>
      new GetUserTripsUseCase(tripRepository, fileStorage, logger),
    inject: ['TRIP_REPOSITORY', 'FILE_STORAGE', 'STRUCTURED_LOGGER'],
  },
];

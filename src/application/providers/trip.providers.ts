import { Provider } from '@nestjs/common';
import {
  CreateTripUseCase,
  GetTripUseCase,
  UpdateTripUseCase,
  DeleteTripUseCase,
  GetUserTripsUseCase,
} from '../use-cases';

export const tripProviders: Provider[] = [
  {
    provide: CreateTripUseCase,
    useFactory: (tripRepository, eventPublisher, logger) =>
      new CreateTripUseCase(tripRepository, eventPublisher, logger),
    inject: ['TRIP_REPOSITORY', 'DOMAIN_EVENT_PUBLISHER', 'STRUCTURED_LOGGER'],
  },
  {
    provide: GetTripUseCase,
    useFactory: (tripRepository, logger) =>
      new GetTripUseCase(tripRepository, logger),
    inject: ['TRIP_REPOSITORY', 'STRUCTURED_LOGGER'],
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
    useFactory: (tripRepository, logger) =>
      new GetUserTripsUseCase(tripRepository, logger),
    inject: ['TRIP_REPOSITORY', 'STRUCTURED_LOGGER'],
  },
];

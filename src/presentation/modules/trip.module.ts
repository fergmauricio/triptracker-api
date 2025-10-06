import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Controllers
import { TripController } from '../controllers/trip.controller';

// Providers
import { infrastructureProviders } from '../../infrastructure/providers';
import { tripProviders } from '@application/providers/trip.providers';

// Modules
import { RabbitMQModule } from '../../infrastructure/adapters/messaging/rabbitmq/rabbitmq.module';
import { QueueModule } from '../../infrastructure/adapters/messaging/queue/queue.module';
import { StructuredLoggerService } from '@infrastructure/adapters/external/logging/structured-logger.service';

@Module({
  imports: [ConfigModule, RabbitMQModule, QueueModule],
  controllers: [TripController],
  providers: [
    ...infrastructureProviders,
    ...tripProviders,
    {
      provide: 'STRUCTURED_LOGGER',
      useClass: StructuredLoggerService,
    },
  ],
  exports: ['TRIP_REPOSITORY', 'DOMAIN_EVENT_PUBLISHER', 'STRUCTURED_LOGGER'],
})
export class TripModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './presentation/modules/auth.module';
import { FileStorageModule } from './presentation/modules/file-storage.module';
import { HealthModule } from '@presentation/modules/health.module';
import { LoggingModule } from '@infrastructure/adapters/external/logging/logging.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { MessagingModule } from '@infrastructure/messaging/messaging.module';
import { TripModule } from '@presentation/modules/trip.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000, // 1 minuto
          limit: 100, // 100 requests por minuto
        },
      ],
    }),
    TripModule,
    MessagingModule,
    LoggingModule,
    HealthModule,
    AuthModule,
    FileStorageModule,
  ],
})
export class AppModule {}

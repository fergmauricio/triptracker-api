import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './presentation/modules/auth.module';
import { FileStorageModule } from './presentation/modules/file-storage.module';
import { HealthModule } from '@presentation/modules/health.module';
import { LoggingModule } from '@infrastructure/adapters/external/logging/logging.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

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
    LoggingModule,
    HealthModule,
    AuthModule,
    FileStorageModule,
  ],
})
export class AppModule {}

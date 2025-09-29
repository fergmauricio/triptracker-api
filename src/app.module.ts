import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './presentation/modules/auth.module';
import { FileStorageModule } from './presentation/modules/file-storage.module';
import { HealthModule } from '@presentation/modules/health.module';
import { LoggingModule } from '@infrastructure/adapters/external/logging/logging.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    LoggingModule,
    HealthModule,
    AuthModule,
    FileStorageModule,
  ],
})
export class AppModule {}

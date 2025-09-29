import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './presentation/modules/auth.module';
import { FileStorageModule } from './presentation/modules/file-storage.module';
import { HealthModule } from '@presentation/modules/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    HealthModule,
    AuthModule,
    FileStorageModule,
  ],
})
export class AppModule {}

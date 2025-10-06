import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';

// Controllers
import { FileStorageController } from '../controllers/file-storage.controller';

// Providers
import {
  FILE_STORAGE,
  infrastructureProviders,
} from '../../infrastructure/providers';
import { fileStorageProviders } from '@application/providers/file-storage.providers';

// Config
import { multerConfig } from '../../infrastructure/config/multer.config';

// Módulos necessários
import { AuthModule } from './auth.module';
import { RabbitMQModule } from '@infrastructure/adapters/messaging/rabbitmq/rabbitmq.module';
import { UploadFileUseCase } from '@application/use-cases/upload-file.use-case';
import { StructuredLoggerService } from '@infrastructure/adapters/external/logging/structured-logger.service';

@Module({
  imports: [AuthModule, RabbitMQModule, MulterModule.register(multerConfig)],
  controllers: [FileStorageController],
  providers: [
    ...infrastructureProviders,
    ...fileStorageProviders,
    {
      provide: 'STRUCTURED_LOGGER',
      useClass: StructuredLoggerService,
    },
  ],
  exports: [FILE_STORAGE, UploadFileUseCase],
})
export class FileStorageModule {}

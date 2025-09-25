import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';

// Controllers
import { FileStorageController } from '../controllers/file-storage.controller';

// Providers
import {
  FILE_STORAGE,
  infrastructureProviders,
} from '../../infrastructure/providers';
import { applicationProviders } from '../../application/providers';

// Config
import { multerConfig } from '../../infrastructure/config/multer.config';

// Módulos necessários
import { AuthModule } from './auth.module';
import { RabbitMQModule } from '../../infrastructure/messaging/rabbitmq/rabbitmq.module';

// Exports
import { UploadAvatarUseCase } from '@application/use-cases/upload-avatar.use-case';
import { GenerateSignedUrlUseCase } from '@application/use-cases/generate-signed-url.use-case';

@Module({
  imports: [AuthModule, RabbitMQModule, MulterModule.register(multerConfig)],
  controllers: [FileStorageController],
  providers: [...infrastructureProviders, ...applicationProviders],
  exports: [FILE_STORAGE, UploadAvatarUseCase, GenerateSignedUrlUseCase],
})
export class FileStorageModule {}

import { Module } from '@nestjs/common';
import { HealthController } from '../controllers/health.controller';
import { PrismaModule } from '../../infrastructure/adapters/persistence/prisma/prisma.module';
import { RabbitMQModule } from '../../infrastructure/adapters/messaging/rabbitmq/rabbitmq.module';
import { StorageModule } from '@infrastructure/adapters/external/storage/storage.module';

@Module({
  imports: [PrismaModule, RabbitMQModule, StorageModule],
  controllers: [HealthController],
})
export class HealthModule {}

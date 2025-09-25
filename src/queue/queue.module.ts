import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { RabbitMQModule } from '../infrastructure/messaging/rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitMQModule],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}

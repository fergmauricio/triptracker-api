import { Module } from '@nestjs/common';
import { QueueAdapter } from './queue.adapter';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitMQModule],
  providers: [QueueAdapter],
  exports: [QueueAdapter],
})
export class QueueModule {}

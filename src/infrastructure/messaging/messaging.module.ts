import { Module } from '@nestjs/common';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
import { EmailEventHandler } from './event-handlers/email-event-handler.service';
import { EmailModule } from '../external-services/email/email.module';

@Module({
  imports: [RabbitMQModule, EmailModule],
  providers: [EmailEventHandler],
  exports: [EmailEventHandler],
})
export class MessagingModule {}

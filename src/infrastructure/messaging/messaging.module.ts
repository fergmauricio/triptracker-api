import { EmailModule } from '@infrastructure/adapters/external/email/email.module';
import { EmailEventHandler } from '@infrastructure/adapters/messaging/event-handlers/email-event-handler.service';
import { RabbitMQModule } from '@infrastructure/adapters/messaging/rabbitmq/rabbitmq.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [RabbitMQModule, EmailModule],
  providers: [EmailEventHandler],
  exports: [EmailEventHandler],
})
export class MessagingModule {}

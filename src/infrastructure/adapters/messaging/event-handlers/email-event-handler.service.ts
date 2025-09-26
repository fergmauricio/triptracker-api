import { Injectable, OnModuleInit, Logger } from '@nestjs/common';

import { EmailService } from '@infrastructure/adapters/external/email/email.service';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';

@Injectable()
export class EmailEventHandler implements OnModuleInit {
  private readonly logger = new Logger(EmailEventHandler.name);

  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly emailService: EmailService,
  ) {}

  async onModuleInit() {
    setTimeout(() => this.setupEmailConsumer(), 3000);
  }

  private async setupEmailConsumer() {
    const channel = this.rabbitMQService.getChannel();

    if (!channel) {
      this.logger.error(
        'RabbitMQ channel não disponível - tentando reconectar em 5s',
      );
      setTimeout(() => this.setupEmailConsumer(), 5000);
      return;
    }

    try {
      await channel.assertQueue('email_queue', { durable: true });

      await channel.consume('email_queue', async (message) => {
        if (message) {
          try {
            const eventData = JSON.parse(message.content.toString());
            await this.handleEmailEvent(eventData);
            channel.ack(message);
            this.logger.log('Evento processado com sucesso');
          } catch (error) {
            this.logger.error('Erro ao processar evento de email:', error);
            channel.nack(message, false, false); // Não recolocar na fila
          }
        }
      });

      this.logger.log('EmailEventHandler ouvindo fila de emails...');
    } catch (error) {
      this.logger.error('Erro ao configurar consumer:', error);
    }
  }

  private async handleEmailEvent(eventData: any) {
    const { eventType, eventData: data } = eventData;

    this.logger.log(`Processando evento: ${eventType}`);

    switch (eventType) {
      case 'PasswordResetRequestedEvent':
        await this.handlePasswordResetEvent(data);
        break;
      case 'UserRegisteredEvent':
        await this.handleUserRegisteredEvent(data);
        break;
      default:
        this.logger.warn(`Evento não tratado: ${eventType}`);
    }
  }

  private async handlePasswordResetEvent(data: any) {
    const { email, token, userName } = data;

    this.logger.log(`Processando reset de senha para: ${email}`);

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;

    const success = await this.emailService.sendPasswordResetEmail(
      email,
      resetLink,
      userName,
    );

    if (success) {
      this.logger.log(`Email de reset enviado para: ${email}`);
    } else {
      throw new Error(`Falha ao enviar email para: ${email}`);
    }
  }

  private async handleUserRegisteredEvent(data: any) {
    const { email, name } = data;

    this.logger.log(`Enviando boas-vindas para: ${email}`);

    const success = await this.emailService.sendWelcomeEmail(email, name);

    if (success) {
      this.logger.log(`Email de boas-vindas enviado para: ${email}`);
    } else {
      throw new Error(`Falha ao enviar email de boas-vindas para: ${email}`);
    }
  }
}

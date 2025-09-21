import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { EmailService } from '../email/email/email.service';

@Injectable()
export class EmailWorkerService implements OnModuleInit {
  private readonly logger = new Logger(EmailWorkerService.name);

  constructor(
    private rabbitMQService: RabbitMQService,
    private emailService: EmailService,
  ) {}

  onModuleInit() {
    this.startWorker();
  }

  private async startWorker() {
    const channel = this.rabbitMQService.getChannel();

    if (!channel) {
      this.logger.error('RabbitMQ channel não disponível');
      return;
    }

    await channel.consume('email_queue', async (message) => {
      if (message) {
        try {
          const data = JSON.parse(message.content.toString());
          await this.handleSendPasswordResetEmail(data);
          channel.ack(message); // Confirma processamento
        } catch (error) {
          this.logger.error('Erro ao processar email job:', error);
          channel.nack(message); // Rejeita mensagem
        }
      }
    });

    this.logger.log('Worker de email ouvindo RabbitMQ...');
  }

  private async handleSendPasswordResetEmail(data: any) {
    const { email, token, userName } = data;
    this.logger.log(`Processando email de reset para: ${email}`);

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;

    try {
      const success = await this.emailService.sendPasswordResetEmail(
        email,
        resetLink,
        userName,
      );

      if (success) {
        this.logger.log(`Email enviado com sucesso para: ${email}`);
      } else {
        throw new Error('Falha ao enviar email');
      }
    } catch (error) {
      this.logger.error(`Falha ao processar email para ${email}:`, error);
      throw error;
    }
  }
}

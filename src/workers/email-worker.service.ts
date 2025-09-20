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
    // Nova implementação com RabbitMQ
    await this.rabbitMQService.consumeEmailJobs(async (data) => {
      await this.handleSendPasswordResetEmail(data);
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

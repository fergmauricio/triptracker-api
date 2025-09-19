import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Worker } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email/email.service';

@Injectable()
export class EmailWorkerService implements OnModuleInit {
  private readonly logger = new Logger(EmailWorkerService.name);
  private worker: Worker;

  constructor(
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  async onModuleInit() {
    this.startWorker();
  }

  private startWorker() {
    // Cria uma instância do Worker conectada ao Redis
    // O worker fica "escutando" a fila 'email' por jobs do tipo 'send-password-reset'
    this.worker = new Worker(
      'email', // Nome da fila que ele vai escutar
      async (job) => {
        // Esta função é executada quando um job chega na fila
        await this.handleSendPasswordResetEmail(job);
      },
      {
        connection: {
          host: this.configService.get('REDIS_HOST'),
          port: this.configService.get('REDIS_PORT'),
        },

        concurrency: 5, // Processa até 5 jobs simultaneamente
        autorun: true, // Inicia automaticamente
      },
    );

    // Eventos para logging e debug
    this.worker.on('ready', () => {
      this.logger.log('Worker de email pronto e ouvindo a fila...');
    });

    this.worker.on('completed', (job) => {
      this.logger.log(`Job ${job.id} (${job.name}) completado com sucesso`);
    });

    this.worker.on('failed', (job, error) => {
      if (job) {
        this.logger.error(
          `Job ${job.id} (${job.name}) falhou: ${error.message}`,
          error.stack,
        );
      }
    });

    this.worker.on('error', (error) => {
      this.logger.error(`Erro no worker: ${error.message}`, error.stack);
    });
  }

  private async handleSendPasswordResetEmail(job: any) {
    const { email, token, userName } = job.data;

    this.logger.log(`Processando email de reset para: ${email}`);

    // Gera o link de reset (ajuste a URL para sua aplicação)
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;

    try {
      // Usa o serviço real de email
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
      throw error; // Faz o job falhar e ser retentado
    }
  }

  // Método para parar o worker graciosamente
  async onApplicationShutdown() {
    if (this.worker) {
      await this.worker.close();
    }
  }
}

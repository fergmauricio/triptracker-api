import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Worker } from 'bullmq';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailWorkerService implements OnModuleInit {
  private readonly logger = new Logger(EmailWorkerService.name);
  private worker: Worker;

  constructor(private configService: ConfigService) {}

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
      this.logger.error(
        `Job ${job.id} (${job.name}) falhou: ${error.message}`,
        error.stack,
      );
    });

    this.worker.on('error', (error) => {
      this.logger.error(`Erro no worker: ${error.message}`, error.stack);
    });
  }

  // Função que processa o job específico de reset de senha
  private async handleSendPasswordResetEmail(job: any) {
    const { email, token, userName } = job.data;

    this.logger.log(`Preparando para enviar email de reset para: ${email}`);

    // LINK SIMULADO
    const resetLink = `http://localhost:3000/auth/reset-password?token=${token}`;

    // SIMULAÇÃO do envio de email
    this.logger.log('=== EMAIL SIMULADO (IMPLEMENTAR SERVIÇO REAL AQUI) ===');
    this.logger.log(`Para: ${email}`);
    this.logger.log(`Assunto: Recuperação de Senha - TripTracker`);
    this.logger.log(`Olá ${userName || 'usuário'},`);
    this.logger.log(`Clique no link para redefinir sua senha: ${resetLink}`);
    this.logger.log('====================================================');

    // Aqui vai a integração com SendGrid, Resend, etc.
    // await this.emailService.sendPasswordResetEmail(email, resetLink, userName);

    // Simula um delay de processamento de 2 segundos
    await new Promise((resolve) => setTimeout(resolve, 2000));

    this.logger.log(`Email simulado enviado para: ${email}`);
  }

  // Método para parar o worker graciosamente
  async onApplicationShutdown() {
    if (this.worker) {
      await this.worker.close();
    }
  }
}

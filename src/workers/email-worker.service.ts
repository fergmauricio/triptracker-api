// src/workers/email-worker.service.ts
import { Injectable } from '@nestjs/common';
import { Worker } from 'bullmq';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailWorkerService {
  private readonly worker: Worker;

  constructor(private configService: ConfigService) {
    this.worker = new Worker(
      'email',
      async (job) => {
        await this.processEmailJob(job);
      },
      {
        connection: {
          host: this.configService.get('REDIS_HOST') || 'localhost',
          port: this.configService.get('REDIS_PORT') || 6379,
        },
      },
    );

    this.worker.on('completed', (job) => {
      console.log(`Job ${job.id} completed`);
    });

    this.worker.on('failed', (job, err) => {
      // Verifique se job existe antes de acessar suas propriedades
      if (job) {
        console.error(`Job ${job.id} failed:`, err);
      } else {
        console.error('Job failed (job undefined):', err);
      }
    });
  }

  private async processEmailJob(job: any) {
    const { email, token, userId } = job.data;

    // Aqui você integraria com seu serviço de email
    // (SendGrid, Resend, SMTP, etc.)
    const resetLink = `http://localhost:3000/auth/reset-password?token=${token}`;

    console.log(`Enviando email para: ${email}`);
    console.log(`Link de reset: ${resetLink}`);

    // Implemente o envio real de email aqui
    // await this.mailService.sendPasswordResetEmail(email, resetLink);
  }
}

import { Injectable, Logger } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import { Resend } from 'resend';
import { EmailSender } from '../../../domain/ports/email-sender.port';

@Injectable()
export class EmailService implements EmailSender {
  private readonly logger = new Logger(EmailService.name);
  private readonly provider: string;

  constructor() {
    this.provider = process.env.EMAIL_PROVIDER || 'resend';
    this.logger.log(`Provedor de email configurado: ${this.provider}`);
  }

  async sendPasswordResetEmail(
    email: string,
    resetLink: string,
    userName?: string,
  ): Promise<boolean> {
    const safeUserName = userName || 'usuário';

    switch (this.provider) {
      case 'sendgrid':
        return this.sendWithSendGrid(email, resetLink, safeUserName);
      case 'resend':
        return this.sendWithResend(email, resetLink, safeUserName);
      default:
        this.logger.error(`Provedor de email desconhecido: ${this.provider}`);
        return false;
    }
  }

  async sendWelcomeEmail(email: string, userName: string): Promise<boolean> {
    this.logger.log(`Enviando email de boas-vindas para: ${email}`);

    switch (this.provider) {
      case 'sendgrid':
        return this.sendWelcomeWithSendGrid(email, userName);
      case 'resend':
        return this.sendWelcomeWithResend(email, userName);
      default:
        this.logger.error(`Provedor não suportado: ${this.provider}`);
        return false;
    }
  }

  private async sendWelcomeWithResend(
    email: string,
    userName: string,
  ): Promise<boolean> {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);

      const { data, error } = await resend.emails.send({
        from: process.env.FROM_EMAIL_RESEND || 'onboarding@resend.dev',
        to: email,
        subject: 'Bem-vindo ao TripTracker!',
        html: this.getWelcomeTemplate(userName),
      });

      if (error) {
        this.logger.error(`Erro no Resend: ${error.message}`);
        return false;
      }

      this.logger.log(`Email de boas-vindas enviado para: ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Erro no Resend: ${error.message}`);
      return false;
    }
  }

  private async sendWelcomeWithSendGrid(
    email: string,
    userName: string,
  ): Promise<boolean> {
    try {
      if (!process.env.SENDGRID_API_KEY) {
        this.logger.error('SENDGRID_API_KEY não configurada');
        return false;
      }

      sgMail.setApiKey(process.env.SENDGRID_API_KEY);

      const msg = {
        to: email,
        from: process.env.FROM_EMAIL_SENDGRID || 'noreply@triptracking.com.br',
        subject: 'Bem-vindo ao TripTracker!',
        html: this.getWelcomeTemplate(userName),
      };

      await sgMail.send(msg);

      this.logger.log(`Email de boas-vindas enviado para: ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Erro no Resend: ${error.message}`);
      return false;
    }
  }

  private async sendWithSendGrid(
    email: string,
    resetLink: string,
    userName: string,
  ): Promise<boolean> {
    if (!process.env.SENDGRID_API_KEY) {
      this.logger.error('SENDGRID_API_KEY não configurada');
      return false;
    }

    try {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);

      const msg = {
        to: email,
        from: process.env.FROM_EMAIL_SENDGRID || 'noreply@triptracking.com.br',
        subject: 'Recuperação de Senha - TripTracking',
        html: this.getPasswordResetTemplate(userName, resetLink),
      };

      await sgMail.send(msg);
      this.logger.log(`Email enviado via SendGrid para: ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Erro no SendGrid: ${error.message}`);
      return false;
    }
  }

  private async sendWithResend(
    email: string,
    resetLink: string,
    userName: string,
  ): Promise<boolean> {
    if (!process.env.RESEND_API_KEY) {
      this.logger.error('RESEND_API_KEY não configurada');
      return false;
    }

    try {
      const resend = new Resend(process.env.RESEND_API_KEY);

      const { data, error } = await resend.emails.send({
        from: process.env.FROM_EMAIL_RESEND || 'onboarding@resend.dev',
        to: email,
        subject: 'Recuperação de Senha - TripTracker',
        html: this.getPasswordResetTemplate(userName, resetLink),
      });

      if (error) {
        this.logger.error(`Erro no Resend: ${error.message}`);
        return false;
      }

      this.logger.log(`Email enviado via Resend para: ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Erro no Resend: ${error.message}`);
      return false;
    }
  }

  private getWelcomeTemplate(userName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bem vindo ao TripTracking!</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button {
              display: inline-block; padding: 12px 24px; background-color: #2563eb;
              color: white; text-decoration: none; border-radius: 5px;
            }
          </style>
      </head>
      <body>
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1>Bem-vindo(a), ${userName}!</h1>
              <p>Estamos muito felizes em tê-lo(a) no TripTracking!</p>
              <p>Agora você pode:</p>
              <ul>
                  <li>📝 Criar e gerenciar suas viagens</li>
                  <li>📍 Rastrear itinerários</li>
                  <li>👥 Compartilhar com amigos</li>
              </ul>
              <p>Qualquer dúvida, estamos à disposição!</p>
              <br>
              <p>Atenciosamente,<br>Equipe TripTracking</p>
          </div>
      </body>
      </html>
    `;
  }

  private getPasswordResetTemplate(
    userName: string,
    resetLink: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Redefinição de Senha</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button {
              display: inline-block; padding: 12px 24px; background-color: #2563eb;
              color: white; text-decoration: none; border-radius: 5px;
            }
          </style>
      </head>
      <body>
          <div class="container">
              <h2>Redefinição de Senha - TripTracking</h2>
              <p>Olá <strong>${userName}</strong>,</p>
              <p>Clique no link abaixo para redefinir sua senha:</p>
              <a href="${resetLink}" class="button">Redefinir Senha</a>
              <p><small>Link válido por 1 hora</small></p>
          </div>
      </body>
      </html>
    `;
  }
}

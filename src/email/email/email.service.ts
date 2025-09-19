import { Injectable, Logger } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
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
        from: process.env.FROM_EMAIL_SENDGRID || 'mauricioferg@gmail.com',
        subject: 'Recuperação de Senha - TripTracker',
        html: this.getPasswordResetTemplate(userName, resetLink),
        text: `Olá ${userName}! Para redefinir sua senha, acesse: ${resetLink}`,
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
        text: `Olá ${userName}! Para redefinir sua senha, acesse: ${resetLink}`,
      });

      if (error) {
        this.logger.error(`Erro no Resend: ${error.message}`);
        return false;
      }

      this.logger.log(`✅ Email enviado via Resend para: ${email}`);
      this.logger.log(`📨 ID: ${data?.id}`);
      return true;
    } catch (error) {
      this.logger.error(`Erro no Resend: ${error.message}`);
      return false;
    }
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
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f9f9f9;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 30px;
              background-color: #ffffff;
              border-radius: 10px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              margin-top: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              color: #2563eb;
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .button {
              display: block;
              width: 200px;
              margin: 30px auto;
              padding: 14px 28px;
              background-color: #2563eb;
              color: white;
              text-decoration: none;
              border-radius: 8px;
              text-align: center;
              font-weight: bold;
              font-size: 16px;
            }
            .button:hover {
              background-color: #1d4ed8;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              text-align: center;
              color: #666;
              font-size: 14px;
            }
            .warning {
              background-color: #fef3c7;
              padding: 15px;
              border-radius: 6px;
              margin: 20px 0;
              border-left: 4px solid #f59e0b;
            }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <div class="logo">✈️ TripTracking</div>
                  <h2>Redefinição de Senha</h2>
              </div>

              <p>Olá <strong>${userName || 'usuário'}</strong>,</p>
              <p>Recebemos uma solicitação para redefinir a senha da sua conta no TripTracker.</p>

              <a href="${resetLink}" class="button">Redefinir Senha</a>

              <div class="warning">
                  <p><strong>⚠️ Link válido por 1 hora</strong></p>
                  <p>Por segurança, este link expirará em 1 hora. Se não solicitou esta redefinição, ignore este email.</p>
              </div>

              <p>Se o botão não funcionar, copie e cole este link no seu navegador:</p>
              <p style="word-break: break-all; color: #2563eb;">${resetLink}</p>

              <div class="footer">
                  <p>Atenciosamente,<br><strong>Equipe TripTracker</strong></p>
                  <p>✉️ <a href="mailto:support@triptracker.com" style="color: #2563eb;">support@triptracker.com</a></p>
              </div>
          </div>
      </body>
      </html>
    `;
  }
}

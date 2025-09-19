import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import sgMail from '@sendgrid/mail';
import { MailDataRequired } from '@sendgrid/helpers/classes/mail';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);

  constructor() {}

  async onModuleInit() {
    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      this.logger.log('SendGrid configurado com sucesso');
    } else {
      this.logger.warn(
        'SENDGRID_API_KEY não encontrada. Emails não serão enviados.',
      );
    }
  }

  async sendPasswordResetEmail(
    email: string,
    resetLink: string,
    userName?: string,
  ): Promise<boolean> {
    // 1. VALIDAÇÃO: Garante que a API Key e FROM_EMAIL existem
    if (!process.env.SENDGRID_API_KEY) {
      this.logger.error('SendGrid não configurado. Email não enviado.');
      return false;
    }

    const fromEmail = process.env.FROM_EMAIL;
    if (!fromEmail) {
      this.logger.error('FROM_EMAIL não configurado no .env');
      return false;
    }

    // 2. Garante que userName não seja undefined
    const safeUserName = userName || 'usuário';

    // 3. Tipagem CORRETA para o objeto de email
    const msg: MailDataRequired = {
      to: email,
      from: fromEmail, // Agora é string, não string | undefined
      subject: 'Recuperação de Senha - TripTracker',
      html: this.getPasswordResetTemplate(safeUserName, resetLink),
      text: `Olá ${safeUserName}! Para redefinir sua senha, acesse: ${resetLink}. Este link expira em 1 hora.`,
    };

    try {
      await sgMail.send(msg);
      this.logger.log(`✅ Email de recuperação enviado para: ${email}`);
      return true;
    } catch (error) {
      this.logger.error(
        `❌ Erro ao enviar email para ${email}:`,
        error.response?.body || error.message,
      );
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

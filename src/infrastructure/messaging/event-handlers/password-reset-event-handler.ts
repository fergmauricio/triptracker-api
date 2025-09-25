import { Injectable, Logger } from '@nestjs/common';
import { PasswordResetRequestedEvent } from '../../../domain/domain-events/password-reset-requested.event';
import { EmailService } from '../../external-services/email/email.service';

@Injectable()
export class PasswordResetEventHandler {
  private readonly logger = new Logger(PasswordResetEventHandler.name);

  constructor(private readonly emailService: EmailService) {}

  async handle(event: PasswordResetRequestedEvent): Promise<void> {
    try {
      this.logger.log(`Processando reset de senha para: ${event.email}`);

      const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password?token=${event.token}`;

      await this.emailService.sendPasswordResetEmail(
        event.email,
        resetLink,
        event.userName,
      );

      this.logger.log(`Email de reset enviado para: ${event.email}`);
    } catch (error) {
      this.logger.error(`Falha ao processar evento: ${error.message}`);
      throw error;
    }
  }
}

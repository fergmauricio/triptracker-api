import { Email } from '@domain/value-objects/email.vo';
import { EmailService } from '@infrastructure/external-services/email/email.service';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class UserRegisteredEventHandler {
  private readonly logger = new Logger(UserRegisteredEventHandler.name);

  constructor(private readonly emailService: EmailService) {}

  async handle(event: any): Promise<void> {
    if (event.eventType !== 'UserRegisteredEvent') {
      return;
    }

    try {
      const { userId, email, name } = event.eventData;

      const objEmail = new Email(email);

      this.logger.log(
        `Enviando email de boas-vindas para: ${objEmail.getValue()}`,
      );

      await this.emailService.sendWelcomeEmail(objEmail.getValue(), name);

      this.logger.log(`Email de boas-vindas enviado para: ${email}`);
    } catch (error) {
      this.logger.error(`Falha ao enviar email de boas-vindas:`, error);
      throw error;
    }
  }
}

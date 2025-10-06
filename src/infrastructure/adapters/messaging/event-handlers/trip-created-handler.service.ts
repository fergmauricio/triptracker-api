import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from '@infrastructure/adapters/external/email/email.service';

@Injectable()
export class TripCreatedEventHandler {
  private readonly logger = new Logger(TripCreatedEventHandler.name);

  constructor(private readonly emailService: EmailService) {}

  async handle(event: any): Promise<void> {
    if (event.eventType !== 'TripCreatedEvent') {
      return;
    }

    try {
      const { tripId, title, userId } = event.eventData;

      this.logger.log(
        `Processando criação de viagem: ${title} (ID: ${tripId}) para usuário: ${userId}`,
      );

      this.logger.log(`Viagem criada processada: ${title}`);
    } catch (error) {
      this.logger.error(`Falha ao processar criação de viagem:`, error);
      throw error;
    }
  }
}

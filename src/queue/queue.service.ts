import { Injectable, Logger } from '@nestjs/common';
import { RabbitMQService } from '../infrastructure/messaging/rabbitmq/rabbitmq.service';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(private rabbitMQService: RabbitMQService) {}

  async addEmailJob(data: any) {
    try {
      await this.rabbitMQService.publishToExchange(
        'domain_events',
        'email_event',
        data,
      );
      this.logger.log('Job adicionado à fila de emails');
    } catch (error) {
      this.logger.error('Erro ao adicionar job na fila:', error);
      throw error;
    }
  }
}

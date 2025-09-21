import { Injectable } from '@nestjs/common';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';

@Injectable()
export class QueueService {
  constructor(private rabbitMQService: RabbitMQService) {}

  async addEmailJob(data: any) {
    await this.rabbitMQService.publishToExchange(
      'trip_events',
      'send-email',
      data,
    );
  }
}

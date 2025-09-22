import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { connect, Connection, Channel } from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: Connection;
  private channel: Channel;

  async onModuleInit() {
    try {
      const rabbitmqUrl = process.env.RABBITMQ_URL;

      if (!rabbitmqUrl) {
        throw new Error('RABBITMQ_URL não configurada');
      }

      this.connection = await connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();

      await this.setupQueues();

      this.logger.log('Conectado ao CloudAMQP com sucesso!');
    } catch (error) {
      this.logger.error('Erro ao conectar com CloudAMQP:', error);
      // Não throw error - permite app rodar sem RabbitMQ
    }
  }

  getChannel(): Channel | null {
    return this.channel || null;
  }

  private async setupQueues() {
    await this.channel.assertExchange('trip_events', 'direct', {
      durable: true,
    });

    await this.channel.assertQueue('email_queue', { durable: true });
    await this.channel.bindQueue('email_queue', 'trip_events', 'send-email');
  }

  async publishToQueue(queue: string, message: any) {
    if (!this.channel) {
      throw new Error('RabbitMQ não conectado');
    }

    await this.channel.sendToQueue(
      queue,
      Buffer.from(JSON.stringify(message)),
      { persistent: true },
    );
  }

  async publishToExchange(exchange: string, routingKey: string, message: any) {
    if (!this.channel) {
      throw new Error('RabbitMQ não conectado');
    }

    await this.channel.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(message)),
      { persistent: true },
    );
  }

  async onModuleDestroy() {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
  }
}

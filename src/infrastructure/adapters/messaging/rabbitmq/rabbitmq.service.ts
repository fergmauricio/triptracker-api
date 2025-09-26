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
  private isConnected = false;

  async onModuleInit() {
    await this.connectWithRetry();
  }

  private async connectWithRetry(retries = 5, delay = 5000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

        this.logger.log(
          `Tentativa ${attempt}/${retries} de conexão com RabbitMQ...`,
        );

        this.connection = await connect(rabbitmqUrl);
        this.channel = await this.connection.createChannel();

        await this.setupQueues();

        this.isConnected = true;
        this.logger.log('Conectado ao RabbitMQ com sucesso!');
        return;
      } catch (error) {
        this.logger.error(`Tentativa ${attempt} falhou: ${error.message}`);

        if (attempt === retries) {
          this.logger.warn(
            'RabbitMQ não disponível - aplicação funcionará sem filas',
          );
          this.isConnected = false;
          return;
        }

        this.logger.log(
          `Aguardando ${delay / 1000}s para próxima tentativa...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  getChannel(): Channel | null {
    return this.isConnected ? this.channel : null;
  }

  isReady(): boolean {
    return this.isConnected;
  }

  private async setupQueues() {
    try {
      await this.channel.deleteQueue('email_queue').catch(() => {});
      await this.channel.deleteQueue('email_queue_dl').catch(() => {});
      await this.channel.deleteExchange('domain_events').catch(() => {});
      await this.channel.deleteExchange('dead_letters').catch(() => {});

      await this.channel.assertExchange('domain_events', 'direct', {
        durable: true,
      });

      await this.channel.assertQueue('email_queue', {
        durable: true,
      });

      await this.channel.bindQueue(
        'email_queue',
        'domain_events',
        'email_event',
      );

      this.logger.log('Filas e exchanges configuradas com sucesso');
    } catch (error) {
      this.logger.error('Erro ao configurar filas:', error.message);
      throw error;
    }
  }

  async publishToQueue(queue: string, message: any) {
    if (!this.isConnected) {
      this.logger.warn('RabbitMQ não conectado - mensagem descartada');
      return;
    }

    try {
      await this.channel.sendToQueue(
        queue,
        Buffer.from(JSON.stringify(message)),
        { persistent: true },
      );
    } catch (error) {
      this.logger.error('Erro ao publicar mensagem:', error);
    }
  }

  async publishToExchange(exchange: string, routingKey: string, message: any) {
    if (!this.isConnected) {
      this.logger.warn('RabbitMQ não conectado - mensagem descartada');
      return;
    }

    try {
      await this.channel.publish(
        exchange,
        routingKey,
        Buffer.from(JSON.stringify(message)),
        { persistent: true },
      );
    } catch (error) {
      this.logger.error('Erro ao publicar no exchange:', error);
    }
  }

  async onModuleDestroy() {
    if (this.channel) {
      try {
        await this.channel.close();
      } catch (error) {
        this.logger.error('Erro ao fechar channel:', error);
      }
    }
    if (this.connection) {
      try {
        await this.connection.close();
      } catch (error) {
        this.logger.error('Erro ao fechar conexão:', error);
      }
    }
    this.logger.log('Conexão RabbitMQ fechada');
  }
}

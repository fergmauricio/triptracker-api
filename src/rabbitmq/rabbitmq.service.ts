import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, Channel, Connection } from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: Connection;
  private channel: Channel;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    try {
      const rabbitmqUrl = this.configService.get('RABBITMQ_URL');

      if (!rabbitmqUrl) {
        this.logger.error(
          'RABBITMQ_URL não configurada nas variáveis de ambiente',
        );
        this.logger.warn(' Serviço de mensageria desabilitado');
        return;
      }

      this.connection = await connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();

      await this.channel.assertExchange('trip_events', 'direct', {
        durable: true,
      });
      await this.channel.assertQueue('email_queue', { durable: true });
      await this.channel.bindQueue(
        'email_queue',
        'trip_events',
        'send-password-reset',
      );

      this.logger.log('RabbitMQ conectado e configurado');
    } catch (error) {
      this.logger.error('Erro ao conectar com RabbitMQ:', error);
    }
  }

  async publishEmailJob(data: any) {
    try {
      this.channel.publish(
        'trip_events',
        'send-password-reset',
        Buffer.from(JSON.stringify(data)),
        { persistent: true }, // Mensagem sobrevive a reinícios
      );
      this.logger.log('📨 Job de email enviado para RabbitMQ');
    } catch (error) {
      this.logger.error('❌ Erro ao publicar job:', error);
      throw error;
    }
  }

  async consumeEmailJobs(callback: (data: any) => Promise<void>) {
    try {
      await this.channel.consume('email_queue', async (message) => {
        if (message) {
          try {
            const data = JSON.parse(message.content.toString());
            await callback(data);
            this.channel.ack(message); // Confirma processamento
          } catch (error) {
            this.logger.error('❌ Erro ao processar job:', error);
            this.channel.nack(message); // Rejeita mensagem
          }
        }
      });
    } catch (error) {
      this.logger.error('❌ Erro ao consumir jobs:', error);
    }
  }

  async onModuleDestroy() {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
  }
}

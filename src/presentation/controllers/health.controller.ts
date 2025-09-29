import { Controller, Get, Injectable } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../../infrastructure/adapters/persistence/prisma/prisma.service';
import { RabbitMQService } from '../../infrastructure/adapters/messaging/rabbitmq/rabbitmq.service';
import { AwsS3Adapter } from '../../infrastructure/adapters/external/storage/aws-s3.adapter';

@ApiTags('health')
@Controller('health')
@Injectable()
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rabbitMQService: RabbitMQService,
    private readonly s3Adapter: AwsS3Adapter,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Health Check da API',
    description: 'Verifica o status de todos os serviços conectados',
  })
  @ApiResponse({
    status: 200,
    description: 'Todos os serviços estão operacionais',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2024-01-01T00:00:00.000Z',
        uptime: 123456.789,
        version: '1.0.0',
        services: {
          database: { status: 'ok', responseTime: 15 },
          rabbitmq: { status: 'ok', responseTime: 5 },
          aws_s3: { status: 'ok', responseTime: 120 },
        },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'Um ou mais serviços estão indisponíveis',
    schema: {
      example: {
        status: 'error',
        timestamp: '2024-01-01T00:00:00.000Z',
        uptime: 123456.789,
        version: '1.0.0',
        services: {
          database: { status: 'ok', responseTime: 15 },
          rabbitmq: {
            status: 'error',
            responseTime: 0,
            error: 'Connection timeout',
          },
          aws_s3: { status: 'ok', responseTime: 120 },
        },
      },
    },
  })
  async check() {
    const startTime = Date.now();
    const services = await this.checkServices();
    const responseTime = Date.now() - startTime;

    const allServicesOk = Object.values(services).every(
      (service) => service.status === 'ok',
    );
    const status = allServicesOk ? 'ok' : 'error';

    return {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: `${responseTime}ms`,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services,
    };
  }

  private async checkServices() {
    const [database, rabbitmq, aws_s3] = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRabbitMQ(),
      this.checkAWS_S3(),
    ]);

    return {
      database:
        database.status === 'fulfilled'
          ? database.value
          : { status: 'error', error: 'Check failed' },
      rabbitmq:
        rabbitmq.status === 'fulfilled'
          ? rabbitmq.value
          : { status: 'error', error: 'Check failed' },
      aws_s3:
        aws_s3.status === 'fulfilled'
          ? aws_s3.value
          : { status: 'error', error: 'Check failed' },
    };
  }

  private async checkDatabase() {
    const startTime = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        responseTime: `${Date.now() - startTime}ms`,
      };
    } catch (error) {
      return {
        status: 'error',
        responseTime: `${Date.now() - startTime}ms`,
        error: error.message,
      };
    }
  }

  private async checkRabbitMQ() {
    const startTime = Date.now();
    try {
      const isConnected = this.rabbitMQService.isReady();
      return {
        status: isConnected ? 'ok' : 'error',
        responseTime: `${Date.now() - startTime}ms`,
        connected: isConnected,
      };
    } catch (error) {
      return {
        status: 'error',
        responseTime: `${Date.now() - startTime}ms`,
        error: error.message,
      };
    }
  }

  private async checkAWS_S3() {
    const startTime = Date.now();
    try {
      const isConfigured = !!this.s3Adapter;
      return {
        status: isConfigured ? 'ok' : 'error',
        responseTime: `${Date.now() - startTime}ms`,
        configured: isConfigured,
      };
    } catch (error) {
      return {
        status: 'error',
        responseTime: `${Date.now() - startTime}ms`,
        error: error.message,
      };
    }
  }

  @Get('simple')
  @ApiOperation({
    summary: 'Health Check Simples',
    description: 'Verificação rápida se a API está respondendo',
  })
  simple() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'API is running',
    };
  }
}

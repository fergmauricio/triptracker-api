import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';

// Controllers
import { AuthController } from '../controllers/auth.controller';

// Providers
import { infrastructureProviders } from '../../infrastructure/providers';
import { applicationProviders } from '../../application/providers';

// Strategies e Guards
import { JwtStrategy } from '../../infrastructure/auth/strategies/jwt.strategy';
import { JwtAuthGuard } from '../../infrastructure/auth/guards/jwt-auth.guard';
import { RabbitMQModule } from '../../infrastructure/messaging/rabbitmq/rabbitmq.module';
import { MessagingModule } from '../../infrastructure/messaging/messaging.module';
import { EmailModule } from '../../infrastructure/external-services/email/email.module';
import { QueueModule } from '../../queue/queue.module';

@Module({
  imports: [
    PassportModule,
    ConfigModule,
    RabbitMQModule,
    MessagingModule,
    EmailModule,
    QueueModule,

    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'fallback-secret',
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    ...infrastructureProviders,
    ...applicationProviders,
    JwtStrategy,
    JwtAuthGuard,
  ],
  exports: [
    'USER_REPOSITORY',
    'PASSWORD_RESET_TOKEN_REPOSITORY',
    'DOMAIN_EVENT_PUBLISHER',
    JwtAuthGuard,
  ],
})
export class AuthModule {}

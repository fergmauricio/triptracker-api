import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';

// Controllers
import { AuthController } from '../controllers/auth.controller';

// Providers
import { infrastructureProviders } from '../../infrastructure/providers';

// Strategies e Guards
import { JwtStrategy } from '../../infrastructure/adapters/auth/strategies/jwt.strategy';
import { JwtAuthGuard } from '../../infrastructure/adapters/auth/guards/jwt-auth.guard';
import { JwtAuthService } from '../../infrastructure/adapters/auth/jwt.service';
// Modules
import { RabbitMQModule } from '../../infrastructure/adapters/messaging/rabbitmq/rabbitmq.module';
import { QueueModule } from '../../infrastructure/adapters/messaging/queue/queue.module';
import { authProviders } from '@application/providers/auth.providers';

@Module({
  imports: [
    PassportModule,
    ConfigModule,
    RabbitMQModule,
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
    ...authProviders,
    JwtAuthService,
    JwtStrategy,
    JwtAuthGuard,
  ],
  exports: [
    'USER_REPOSITORY',
    'PASSWORD_RESET_TOKEN_REPOSITORY',
    'DOMAIN_EVENT_PUBLISHER',
    JwtAuthService,
    JwtAuthGuard,
  ],
})
export class AuthModule {}

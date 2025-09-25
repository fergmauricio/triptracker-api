import { Provider } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';

// Repositories
import { PrismaUserRepository } from './persistence/repositories/prisma-user.repository';
import { PrismaPasswordResetTokenRepository } from './persistence/repositories/prisma-password-reset-token.repository';

// Services
import { JwtAuthService } from './auth/jwt.service';
import { PasswordHasherService } from './external-services/password-hasher.service';
import { QueueEventPublisher } from './external-services/queue-event-publisher';
import { EmailService } from './external-services/email/email.service';

// Injection Tokens
export const USER_REPOSITORY = 'USER_REPOSITORY';
export const PASSWORD_RESET_TOKEN_REPOSITORY =
  'PASSWORD_RESET_TOKEN_REPOSITORY';
export const DOMAIN_EVENT_PUBLISHER = 'DOMAIN_EVENT_PUBLISHER';

export const infrastructureProviders: Provider[] = [
  PrismaService,
  QueueService,
  {
    provide: USER_REPOSITORY,
    useClass: PrismaUserRepository,
  },
  {
    provide: PASSWORD_RESET_TOKEN_REPOSITORY,
    useClass: PrismaPasswordResetTokenRepository,
  },
  EmailService,
  JwtAuthService,
  PasswordHasherService,
  {
    provide: DOMAIN_EVENT_PUBLISHER,
    useClass: QueueEventPublisher,
  },
];

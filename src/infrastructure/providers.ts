import { Provider } from '@nestjs/common';

// Adapters
import { PrismaUserRepository } from './adapters/persistence/repositories/prisma-user.repository';
import { PrismaPasswordResetTokenRepository } from './adapters/persistence/repositories/prisma-password-reset-token.repository';
import { AwsS3Adapter } from './adapters/aws-s3.adapter';
import { PrismaService } from './adapters/persistence/prisma/prisma.service';
import { QueueAdapter } from './adapters/messaging/queue/queue.adapter';
import { EmailService } from './adapters/external/email/email.service';

import { PasswordHasherService } from './adapters/external/password-hasher.service';

// Injection Tokens
export const USER_REPOSITORY = 'USER_REPOSITORY';
export const PASSWORD_RESET_TOKEN_REPOSITORY =
  'PASSWORD_RESET_TOKEN_REPOSITORY';
export const DOMAIN_EVENT_PUBLISHER = 'DOMAIN_EVENT_PUBLISHER';
export const FILE_STORAGE = 'FILE_STORAGE';

export const infrastructureProviders: Provider[] = [
  PrismaService,

  {
    provide: USER_REPOSITORY,
    useClass: PrismaUserRepository,
  },
  {
    provide: PASSWORD_RESET_TOKEN_REPOSITORY,
    useClass: PrismaPasswordResetTokenRepository,
  },
  EmailService,
  //JwtAuthService,
  PasswordHasherService,
  {
    provide: FILE_STORAGE,
    useClass: AwsS3Adapter,
  },
  {
    provide: DOMAIN_EVENT_PUBLISHER,
    useClass: QueueAdapter,
  },
];

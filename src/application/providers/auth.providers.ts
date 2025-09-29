import { Provider } from '@nestjs/common';
import { SignUpUseCase } from '../use-cases/signup.use-case';
import { SignInUseCase } from '../use-cases/signin.use-case';
import { ForgotPasswordUseCase } from '../use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from '../use-cases/reset-password.use-case';
import {
  USER_REPOSITORY,
  PASSWORD_RESET_TOKEN_REPOSITORY,
  DOMAIN_EVENT_PUBLISHER,
} from '../../infrastructure/providers';
import { JwtAuthService } from '../../infrastructure/adapters/auth/jwt.service';
import { StructuredLoggerService } from '@infrastructure/adapters/external/logging/structured-logger.service';

export const authProviders: Provider[] = [
  {
    provide: SignUpUseCase,
    useFactory: (userRepository, jwtAuthService, eventPublisher, logger) =>
      new SignUpUseCase(userRepository, jwtAuthService, eventPublisher, logger),
    inject: [
      USER_REPOSITORY,
      JwtAuthService,
      DOMAIN_EVENT_PUBLISHER,
      StructuredLoggerService,
    ],
  },
  {
    provide: SignInUseCase,
    useFactory: (userRepository, jwtAuthService) =>
      new SignInUseCase(userRepository, jwtAuthService),
    inject: [USER_REPOSITORY, JwtAuthService],
  },
  {
    provide: ForgotPasswordUseCase,
    useFactory: (userRepository, passwordResetTokenRepo, eventPublisher) =>
      new ForgotPasswordUseCase(
        userRepository,
        passwordResetTokenRepo,
        eventPublisher,
      ),
    inject: [
      USER_REPOSITORY,
      PASSWORD_RESET_TOKEN_REPOSITORY,
      DOMAIN_EVENT_PUBLISHER,
    ],
  },
  {
    provide: ResetPasswordUseCase,
    useFactory: (passwordResetTokenRepo, userRepository) =>
      new ResetPasswordUseCase(passwordResetTokenRepo, userRepository),
    inject: [PASSWORD_RESET_TOKEN_REPOSITORY, USER_REPOSITORY],
  },
];

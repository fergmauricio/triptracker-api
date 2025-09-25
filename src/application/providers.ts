import { Provider } from '@nestjs/common';

// Use Cases
import { SignUpUseCase } from './use-cases/signup.use-case';
import { SignInUseCase } from './use-cases/signin.use-case';
import { ForgotPasswordUseCase } from './use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from './use-cases/reset-password.use-case';

// Infrastructure Services
import { JwtAuthService } from '../infrastructure/auth/jwt.service';

// Injection Tokens
import {
  USER_REPOSITORY,
  PASSWORD_RESET_TOKEN_REPOSITORY,
  DOMAIN_EVENT_PUBLISHER,
} from '../infrastructure/providers';

export const applicationProviders: Provider[] = [
  {
    provide: SignUpUseCase,
    useFactory: (
      userRepository: any,
      jwtAuthService: JwtAuthService,
      eventPublisher: any,
    ) => new SignUpUseCase(userRepository, jwtAuthService, eventPublisher),
    inject: [USER_REPOSITORY, JwtAuthService, DOMAIN_EVENT_PUBLISHER],
  },
  {
    provide: SignInUseCase,
    useFactory: (userRepository: any, jwtAuthService: JwtAuthService) =>
      new SignInUseCase(userRepository, jwtAuthService),
    inject: [USER_REPOSITORY, JwtAuthService],
  },
  {
    provide: ForgotPasswordUseCase,
    useFactory: (
      userRepository: any,
      passwordResetTokenRepository: any,
      eventPublisher: any,
    ) =>
      new ForgotPasswordUseCase(
        userRepository,
        passwordResetTokenRepository,
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
    useFactory: (passwordResetTokenRepository: any, userRepository: any) =>
      new ResetPasswordUseCase(passwordResetTokenRepository, userRepository),
    inject: [PASSWORD_RESET_TOKEN_REPOSITORY, USER_REPOSITORY],
  },
];

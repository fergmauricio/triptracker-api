import { Injectable } from '@nestjs/common';
import type { PasswordResetTokenRepository } from '../../domain/repository-interfaces/password-reset-token.repository';
import type { UserRepository } from '../../domain/repository-interfaces/user.repository';
import type { DomainEventPublisher } from '../../domain/ports/domain-event-publisher.port';
import { Email } from '../../domain/value-objects/email.vo';
import { PasswordResetTokenFactory } from '../../domain/factories/password-reset-token.factory';
import { PasswordResetRequestedEvent } from '../../domain/domain-events/password-reset-requested.event';
import { StructuredLoggerService } from '@infrastructure/adapters/external/logging/structured-logger.service';

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordResetTokenRepository: PasswordResetTokenRepository,
    private readonly eventPublisher: DomainEventPublisher,
    private readonly logger: StructuredLoggerService,
  ) {}

  async execute(email: string): Promise<{ message: string }> {
    const emailVO = new Email(email);
    const user = await this.userRepository.findByEmail(emailVO);

    if (!user || !user.isActive()) {
      return {
        message:
          'Se o email existir em nosso sistema, um link de redefinição será enviado',
      };
    }

    await this.passwordResetTokenRepository.deleteByUserId(
      user.getId().getValue(),
    );

    const resetToken = PasswordResetTokenFactory.create(user.getId());
    await this.passwordResetTokenRepository.save(resetToken);

    const event = new PasswordResetRequestedEvent(
      user.getEmail().getValue(),
      resetToken.getToken(),
      user.getName(),
    );

    this.logger.log(
      'Tentativa de Recuperação de senha',
      'ForgotPasswordUseCase',
      {
        email: user.getEmail().getValue(),
        token: resetToken.getToken(),
      },
    );

    await this.eventPublisher.publish(event);

    return {
      message:
        'Se o email existir em nosso sistema, um link de redefinição será enviado',
    };
  }
}

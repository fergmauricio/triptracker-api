import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.vo';

import type { DomainEventPublisher } from '../../domain/ports/domain-event-publisher.port';
import type { IUserRepository } from '@domain/ports/user-repository.port';
import { JwtAuthService } from '@infrastructure/index';
import { SignUpCommand } from '@application/commands/signup-command';
import { StructuredLoggerService } from '@infrastructure/adapters/external/logging/structured-logger.service';

export class SignUpUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly jwtAuthService: JwtAuthService,
    private readonly eventPublisher: DomainEventPublisher,
    private readonly logger: StructuredLoggerService,
  ) {}

  async execute(
    command: SignUpCommand,
  ): Promise<{ userId: number; accessToken: string }> {
    this.logger.log('Inicializando SignUpUseCase', 'SignUpUseCase', {
      email: command.email,
      name: command.name,
    });

    try {
      const email = new Email(command.email);

      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        this.logger.warn(
          'Tentativa de registro com e-mail já existente',
          'SignUpUseCase',
          {
            email: command.email,
          },
        );
        throw new Error('EMAIL_ALREADY_EXISTS');
      }

      const user = await User.create(command.name, email, command.password);

      this.logger.log('Usuário registrado com sucesso', 'SignUpUseCase', {
        userId: user.getId().getValue(),
        email: command.email,
      });

      await this.userRepository.save(user);

      const events = user.getDomainEvents();

      if (events.length > 0 && this.eventPublisher) {
        for (const event of events) {
          await this.eventPublisher.publish(event);

          this.logger.log('Publicando evento', 'SignUpUseCase', {
            eventType: event.getEventName(),
            userId: user.getId().getValue(),
          });
        }
        user.clearDomainEvents();
      }

      const accessToken = await this.jwtAuthService.generateAccessToken(user);

      this.logger.log('Registro de usuário completo', 'SignUpUseCase', {
        userId: user.getId().getValue(),
        email: command.email,
      });

      return {
        userId: user.getId().getValue(),
        accessToken,
      };
    } catch (error) {
      this.logger.error(
        'Registro de usuário falhou',
        error.stack,
        'SignUpUseCase',
        {
          email: command.email,
          error: error.message,
        },
      );
      throw error;
    }
  }
}

import { IUserRepository } from '@domain/ports/user-repository.port';
import { Email } from '../../domain/value-objects/email.vo';
import { JwtAuthService } from '@infrastructure/index';
import { StructuredLoggerService } from '@infrastructure/adapters/external/logging/structured-logger.service';
import { SignInCommand } from '@application/commands/signin-command';

export class SignInUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly jwtAuthService: JwtAuthService,
    private readonly logger: StructuredLoggerService,
  ) {}

  async execute(
    command: SignInCommand,
  ): Promise<{ userId: number; accessToken: string }> {
    this.logger.log('Inicializando SignInUseCase', 'SignInUseCase', {
      email: command.email,
    });

    const emailVO = new Email(command.email);

    const user = await this.userRepository.findByEmail(emailVO);

    if (!user) {
      this.logger.log(
        'Tentativa de SignIn com Usuário Inexistente',
        'SignInUseCase',
        {
          email: command.email,
        },
      );

      throw new Error('INVALID_CREDENTIALS');
    }

    if (!user.isActive()) {
      this.logger.log(
        'Tentativa de SignIn com Conta Desabilitada',
        'SignInUseCase',
        {
          email: command.email,
        },
      );

      throw new Error('ACCOUNT_DISABLED');
    }

    const isValidPassword = await user.verifyPassword(command.password);

    if (!isValidPassword) {
      this.logger.warn(
        'Tentativa de SignIn com Senha incorreta',
        'SignInUseCase',
        {
          email: command.email,
        },
      );
      throw new Error('INVALID_CREDENTIALS');
    }

    const accessToken = await this.jwtAuthService.generateAccessToken(user);

    this.logger.log('Usuário logado com sucesso', 'SignInUseCase', {
      email: command.email,
      userId: user.getId().getValue(),
    });

    return {
      userId: user.getId().getValue(),
      accessToken,
    };
  }
}

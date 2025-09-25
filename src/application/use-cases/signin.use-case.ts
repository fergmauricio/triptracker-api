import { Email } from '../../domain/value-objects/email.vo';
import { JwtAuthService } from '../../infrastructure/auth/jwt.service';

export interface IUserRepository {
  findByEmail(email: Email): Promise<any | null>;
}

export class SignInUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly jwtAuthService: JwtAuthService,
  ) {}

  async execute(
    email: string,
    password: string,
  ): Promise<{ userId: number; accessToken: string }> {
    const emailVO = new Email(email);
    const user = await this.userRepository.findByEmail(emailVO);

    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }

    if (!user.isActive()) {
      throw new Error('ACCOUNT_DISABLED');
    }

    const isValidPassword = await user.verifyPassword(password);
    if (!isValidPassword) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const accessToken = await this.jwtAuthService.generateAccessToken(user);

    return {
      userId: user.getId().getValue(),
      accessToken,
    };
  }
}

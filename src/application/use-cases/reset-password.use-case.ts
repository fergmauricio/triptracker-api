import { PasswordResetTokenRepository } from '../../domain/repository-interfaces/password-reset-token.repository';
import { UserRepository } from '../../domain/repository-interfaces/user.repository';

export class ResetPasswordUseCase {
  constructor(
    private readonly passwordResetTokenRepository: PasswordResetTokenRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(
    token: string,
    newPassword: string,
  ): Promise<{ message: string; details?: string }> {
    const resetToken =
      await this.passwordResetTokenRepository.findByToken(token);

    if (!resetToken) {
      throw new Error('INVALID_TOKEN');
    }

    if (resetToken.isExpired()) {
      await this.passwordResetTokenRepository.delete(resetToken);
      throw new Error('EXPIRED_TOKEN');
    }

    const user = await this.userRepository.findById(resetToken.getUserId());
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    await user.changePassword('', newPassword);
    await this.userRepository.save(user);

    await this.passwordResetTokenRepository.delete(resetToken);

    return {
      message: 'Senha redefinida com sucesso',
      details: 'Você já pode fazer login com sua nova senha',
    };
  }
}

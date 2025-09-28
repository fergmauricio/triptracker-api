import { ResetPasswordUseCase } from '../reset-password.use-case';
import { PasswordResetTokenRepository } from '../../../domain/repository-interfaces/password-reset-token.repository';
import { UserRepository } from '../../../domain/repository-interfaces/user.repository';
import { PasswordResetToken } from '../../../domain/entities/password-reset-token.entity';
import { User } from '../../../domain/entities/user.entity';
import { UserId } from '../../../domain/value-objects/user-id.vo';

describe('ResetPasswordUseCase', () => {
  let useCase: ResetPasswordUseCase;
  let passwordResetTokenRepository: PasswordResetTokenRepository;
  let userRepository: UserRepository;

  const mockPasswordResetTokenRepository: PasswordResetTokenRepository = {
    findByToken: jest.fn(),
    save: jest.fn(),
    deleteByUserId: jest.fn(),
    delete: jest.fn(),
  };

  const mockUserRepository: UserRepository = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    save: jest.fn(),
    existsWithEmail: jest.fn(),
  };

  const validUserId = new UserId(1);
  const expiredUserId = new UserId(2);
  const nonExistentUserId = new UserId(999);

  beforeEach(() => {
    useCase = new ResetPasswordUseCase(
      mockPasswordResetTokenRepository,
      mockUserRepository,
    );

    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('execute', () => {
    it('deve redefinir a senha com sucesso quando token é válido', async () => {
      // Arrange
      const token = 'valid-token';
      const newPassword = 'new-strong-password';

      const mockUser = {
        ...User.fromPersistence(
          1,
          'Maurício',
          'mauricio@triptracking.com.br',
          'old-hashed-password',
          true,
        ),
        changePassword: jest.fn().mockResolvedValue(undefined),
      };

      const validResetToken = new PasswordResetToken(
        1,
        'valid-token',
        validUserId,
        new Date(Date.now() + 60 * 60 * 1000),
        new Date(),
      );

      mockPasswordResetTokenRepository.findByToken.mockResolvedValue(
        validResetToken,
      );
      mockUserRepository.findById.mockResolvedValue(mockUser as any);
      mockUserRepository.save.mockResolvedValue(undefined);
      mockPasswordResetTokenRepository.delete.mockResolvedValue(undefined);

      // Act
      const result = await useCase.execute(token, newPassword);

      // Assert
      expect(result).toEqual({
        message: 'Senha redefinida com sucesso',
        details: 'Você já pode fazer login com sua nova senha',
      });

      expect(mockUser.changePassword).toHaveBeenCalledWith('', newPassword);

      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);

      expect(mockPasswordResetTokenRepository.delete).toHaveBeenCalledWith(
        validResetToken,
      );
    });

    it('deve lançar erro quando token não existe', async () => {
      // Arrange
      const token = 'invalid-token';
      const newPassword = 'new-password';

      mockPasswordResetTokenRepository.findByToken.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(token, newPassword)).rejects.toThrow(
        'INVALID_TOKEN',
      );
    });

    it('deve lançar erro quando token está expirado e deletar o token', async () => {
      // Arrange
      const token = 'expired-token';
      const newPassword = 'new-password';

      const expiredResetToken = new PasswordResetToken(
        2,
        'expired-token',
        expiredUserId,
        new Date(Date.now() - 60 * 60 * 1000),
        new Date(),
      );

      mockPasswordResetTokenRepository.findByToken.mockResolvedValue(
        expiredResetToken,
      );
      mockPasswordResetTokenRepository.delete.mockResolvedValue(undefined);

      // Act & Assert
      await expect(useCase.execute(token, newPassword)).rejects.toThrow(
        'EXPIRED_TOKEN',
      );

      expect(mockPasswordResetTokenRepository.delete).toHaveBeenCalledWith(
        expiredResetToken,
      );
    });

    it('deve lançar erro quando usuário não é encontrado', async () => {
      // Arrange
      const token = 'valid-token';
      const newPassword = 'new-password';

      const validResetToken = new PasswordResetToken(
        1,
        'valid-token',
        validUserId,
        new Date(Date.now() + 60 * 60 * 1000),
        new Date(),
      );

      mockPasswordResetTokenRepository.findByToken.mockResolvedValue(
        validResetToken,
      );
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(token, newPassword)).rejects.toThrow(
        'USER_NOT_FOUND',
      );
    });

    it('deve propagar erro do repositório ao salvar usuário', async () => {
      const token = 'valid-token';
      const newPassword = 'new-password';
      const saveError = new Error('Database connection failed');

      const mockUser = {
        ...User.fromPersistence(
          1,
          'Maurício',
          'mauricio@triptracking.com.br',
          'old-hashed-password',
          true,
        ),
        changePassword: jest.fn().mockResolvedValue(undefined),
      };

      const validResetToken = new PasswordResetToken(
        1,
        'valid-token',
        validUserId,
        new Date(Date.now() + 60 * 60 * 1000),
        new Date(),
      );

      mockPasswordResetTokenRepository.findByToken.mockResolvedValue(
        validResetToken,
      );
      mockUserRepository.findById.mockResolvedValue(mockUser as any);
      mockUserRepository.save.mockRejectedValue(saveError);

      await expect(useCase.execute(token, newPassword)).rejects.toThrow(
        'Database connection failed',
      );

      expect(mockPasswordResetTokenRepository.delete).not.toHaveBeenCalled();
    });
  });
});

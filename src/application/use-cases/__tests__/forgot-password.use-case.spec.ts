import { ForgotPasswordUseCase } from '../forgot-password.use-case';
import { UserRepository } from '../../../domain/repository-interfaces/user.repository';
import { PasswordResetTokenRepository } from '../../../domain/repository-interfaces/password-reset-token.repository';
import { DomainEventPublisher } from '../../../domain/ports/domain-event-publisher.port';
import { User } from '../../../domain/entities/user.entity';
import { Email } from '../../../domain/value-objects/email.vo';

import { PasswordResetToken } from '../../../domain/entities/password-reset-token.entity';

describe('ForgotPasswordUseCase', () => {
  let useCase: ForgotPasswordUseCase;
  let userRepository: UserRepository;
  let passwordResetTokenRepository: PasswordResetTokenRepository;
  let eventPublisher: DomainEventPublisher;

  // Mocks
  const mockUserRepository: UserRepository = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    save: jest.fn(),
    existsWithEmail: jest.fn(),
  };

  const mockPasswordResetTokenRepository: PasswordResetTokenRepository = {
    findByToken: jest.fn(),
    save: jest.fn(),
    deleteByUserId: jest.fn(),
    delete: jest.fn(),
  };

  const mockEventPublisher: DomainEventPublisher = {
    publish: jest.fn(),
    publishAll: jest.fn(),
  };

  const activeUser = User.fromPersistence(
    1,
    'Maurício',
    'mauricio@triptracking.com.br',
    'hashed-password',
    true,
  );

  const inactiveUser = User.fromPersistence(
    2,
    'Ferg',
    'ferg@triptracking.com.br',
    'hashed-password',
    false,
  );

  beforeEach(() => {
    useCase = new ForgotPasswordUseCase(
      mockUserRepository,
      mockPasswordResetTokenRepository,
      mockEventPublisher,
    );

    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('execute', () => {
    it('deve enviar email de reset quando usuário existe e está ativo', async () => {
      // Arrange
      const email = 'mauricio@triptracking.com.br';

      mockUserRepository.findByEmail.mockResolvedValue(activeUser);
      mockPasswordResetTokenRepository.deleteByUserId.mockResolvedValue(
        undefined,
      );
      mockPasswordResetTokenRepository.save.mockResolvedValue(undefined);
      mockEventPublisher.publish.mockResolvedValue(undefined);

      // Act
      const result = await useCase.execute(email);

      // Assert
      expect(result).toEqual({
        message:
          'Se o email existir em nosso sistema, um link de redefinição será enviado',
      });

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        expect.any(Email),
      );

      expect(
        mockPasswordResetTokenRepository.deleteByUserId,
      ).toHaveBeenCalledWith(1);

      expect(mockPasswordResetTokenRepository.save).toHaveBeenCalledWith(
        expect.any(PasswordResetToken),
      );

      expect(mockEventPublisher.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'mauricio@triptracking.com.br',
          token: expect.any(String),
          userName: 'Maurício',
        }),
      );
    });

    it('deve retornar mensagem genérica quando usuário não existe', async () => {
      // Arrange
      const email = 'naooo@triptracking.com.br';

      mockUserRepository.findByEmail.mockResolvedValue(null);

      // Act
      const result = await useCase.execute(email);

      // Assert
      expect(result).toEqual({
        message:
          'Se o email existir em nosso sistema, um link de redefinição será enviado',
      });

      expect(mockUserRepository.findByEmail).toHaveBeenCalled();
      expect(
        mockPasswordResetTokenRepository.deleteByUserId,
      ).not.toHaveBeenCalled();
      expect(mockPasswordResetTokenRepository.save).not.toHaveBeenCalled();
      expect(mockEventPublisher.publish).not.toHaveBeenCalled();
    });

    it('deve retornar mensagem genérica quando usuário existe mas está inativo', async () => {
      // Arrange
      const email = 'teste@triptracking.com.br';

      mockUserRepository.findByEmail.mockResolvedValue(inactiveUser);

      // Act
      const result = await useCase.execute(email);

      // Assert
      expect(result).toEqual({
        message:
          'Se o email existir em nosso sistema, um link de redefinição será enviado',
      });

      expect(mockUserRepository.findByEmail).toHaveBeenCalled();
      expect(
        mockPasswordResetTokenRepository.deleteByUserId,
      ).not.toHaveBeenCalled();
      expect(mockPasswordResetTokenRepository.save).not.toHaveBeenCalled();
      expect(mockEventPublisher.publish).not.toHaveBeenCalled();
    });

    it('deve lidar com erro na publicação do evento e ainda retornar mensagem de sucesso', async () => {
      // Arrange
      const email = 'mauricio@triptracking.com.br';

      mockUserRepository.findByEmail.mockResolvedValue(activeUser);
      mockPasswordResetTokenRepository.deleteByUserId.mockResolvedValue(
        undefined,
      );
      mockPasswordResetTokenRepository.save.mockResolvedValue(undefined);

      mockEventPublisher.publish.mockRejectedValue(
        new Error('Falha no RabbitMQ'),
      );

      // Act & Assert
      await expect(useCase.execute(email)).rejects.toThrow('Falha no RabbitMQ');
    });

    it('deve lidar com erro ao salvar token e propagar o erro', async () => {
      // Arrange
      const email = 'mauricio@triptracking.com.br';
      const saveError = new Error('Falha ao salvar token');

      mockUserRepository.findByEmail.mockResolvedValue(activeUser);
      mockPasswordResetTokenRepository.deleteByUserId.mockResolvedValue(
        undefined,
      );
      mockPasswordResetTokenRepository.save.mockRejectedValue(saveError);

      // Act & Assert
      await expect(useCase.execute(email)).rejects.toThrow(
        'Falha ao salvar token',
      );

      expect(mockEventPublisher.publish).not.toHaveBeenCalled();
    });

    it('deve lidar com erro ao deletar tokens antigos e propagar o erro', async () => {
      // Arrange
      const email = 'mauricio@triptracking.com.br';
      const deleteError = new Error('Falha ao deletar tokens');

      mockUserRepository.findByEmail.mockResolvedValue(activeUser);
      mockPasswordResetTokenRepository.deleteByUserId.mockRejectedValue(
        deleteError,
      );

      // Act & Assert
      await expect(useCase.execute(email)).rejects.toThrow(
        'Falha ao deletar tokens',
      );

      expect(mockPasswordResetTokenRepository.save).not.toHaveBeenCalled();
      expect(mockEventPublisher.publish).not.toHaveBeenCalled();
    });
  });
});

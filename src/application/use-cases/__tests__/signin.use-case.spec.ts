import { SignInUseCase } from '../signin.use-case';
import { IUserRepository } from '../../../domain/ports/user-repository.port';
import { JwtAuthService } from '../../../infrastructure/adapters/auth/jwt.service';
import { StructuredLoggerService } from '../../../infrastructure/adapters/external/logging/structured-logger.service';
import { SignInCommand } from '../../../application/commands/signin-command';
import { User } from '../../../domain/entities/user.entity';
import { Email } from '../../../domain/value-objects/email.vo';

describe('SignInUseCase', () => {
  let useCase: SignInUseCase;
  let userRepository: IUserRepository;
  let jwtAuthService: JwtAuthService;
  let logger: StructuredLoggerService;

  const mockUserRepository: IUserRepository = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    save: jest.fn(),
    existsWithEmail: jest.fn(),
  };

  const mockJwtAuthService = {
    generateAccessToken: jest.fn(),
    verifyToken: jest.fn(),
  };

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  };

  const mockUser = User.fromPersistence(
    1,
    'João Silva',
    'mauricio@triptracking.com.br',
    'hashed-password',
    true,
  );

  beforeEach(() => {
    useCase = new SignInUseCase(
      mockUserRepository,
      mockJwtAuthService as any,
      mockLogger as any,
    );

    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('deve autenticar usuário com credenciais válidas', async () => {
      const command = new SignInCommand(
        'mauricio@triptracking.com.br',
        'senha123',
      );

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(mockUser, 'verifyPassword').mockResolvedValue(true);
      mockJwtAuthService.generateAccessToken.mockResolvedValue('jwt-token-123');

      const result = await useCase.execute(command);

      expect(result).toEqual({
        userId: 1,
        accessToken: 'jwt-token-123',
      });

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        expect.any(Email),
      );
      expect(mockUser.verifyPassword).toHaveBeenCalledWith('senha123');
      expect(mockJwtAuthService.generateAccessToken).toHaveBeenCalledWith(
        mockUser,
      );
    });

    it('deve lançar erro quando usuário não existe', async () => {
      const command = new SignInCommand('nope@triptracking.com.br', 'senha123');

      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(useCase.execute(command)).rejects.toThrow(
        'INVALID_CREDENTIALS',
      );

      expect(mockLogger.log).toHaveBeenCalledWith(
        'Tentativa de SignIn com Usuário Inexistente',
        'SignInUseCase',
        { email: 'nope@triptracking.com.br' },
      );
    });

    it('deve lançar erro quando conta está desabilitada', async () => {
      const command = new SignInCommand(
        'mauricio@triptracking.com.br',
        'senha123',
      );
      const inactiveUser = User.fromPersistence(
        2,
        'Maria Silva',
        'maria@triptracking.com.br',
        'hashed-password',
        false,
      );

      mockUserRepository.findByEmail.mockResolvedValue(inactiveUser);

      await expect(useCase.execute(command)).rejects.toThrow(
        'ACCOUNT_DISABLED',
      );
    });

    it('deve lançar erro quando senha está incorreta', async () => {
      const command = new SignInCommand(
        'mauricio@triptracking.com.br',
        'senha-errada',
      );

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(mockUser, 'verifyPassword').mockResolvedValue(false);

      await expect(useCase.execute(command)).rejects.toThrow(
        'INVALID_CREDENTIALS',
      );
    });

    it('deve propagar erro do repositório', async () => {
      const command = new SignInCommand(
        'mauricio@triptracking.com.br',
        'senha123',
      );
      const repositoryError = new Error('Erro de conexão com o banco');

      mockUserRepository.findByEmail.mockRejectedValue(repositoryError);

      await expect(useCase.execute(command)).rejects.toThrow(
        'Erro de conexão com o banco',
      );
    });
  });
});

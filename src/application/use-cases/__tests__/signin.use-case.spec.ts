import { SignInUseCase } from '../signin.use-case';
import { Email } from '../../../domain/value-objects/email.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';

jest.mock('../../../infrastructure/adapters/auth/jwt.service');

describe('SignInUseCase', () => {
  let useCase: SignInUseCase;
  let mockUserRepository: any;
  let mockJwtAuthService: any;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
    };

    mockJwtAuthService = {
      generateAccessToken: jest.fn(),
    };

    useCase = new SignInUseCase(mockUserRepository, mockJwtAuthService);

    // Suppress console.log
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('when signing in with valid credentials', () => {
    it('should return user ID and access token', async () => {
      // ARRANGE
      const email = 'mauricio@triptracking.com.br';
      const password = 'correctPassword';

      const mockUser = {
        getId: () => new UserId(123),
        isActive: () => true,
        verifyPassword: jest.fn().mockResolvedValue(true),
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockJwtAuthService.generateAccessToken.mockResolvedValue('jwt_token_123');

      // ACT
      const result = await useCase.execute(email, password);

      // ASSERT
      expect(result).toEqual({
        userId: 123,
        accessToken: 'jwt_token_123',
      });

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        expect.any(Email),
      );
      expect(mockUser.verifyPassword).toHaveBeenCalledWith(password);
      expect(mockJwtAuthService.generateAccessToken).toHaveBeenCalledWith(
        mockUser,
      );
    });
  });

  describe('when signing in with non-existent email', () => {
    it('should throw INVALID_CREDENTIALS error', async () => {
      // ARRANGE
      const email = 'nope@triptracking.com.br';
      const password = 'anyPassword123';

      mockUserRepository.findByEmail.mockResolvedValue(null); // Usuário não existe

      // ACT & ASSERT
      await expect(useCase.execute(email, password)).rejects.toThrow(
        'INVALID_CREDENTIALS',
      );

      // 📌 EXPLICAÇÃO 4: Verificar que parou no findByEmail
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        expect.any(Email),
      );
      // Não deve chegar a verificar senha ou gerar token
    });
  });

  // 🧪 TESTE 3: Usuário desativado
  describe('when signing in with disabled account', () => {
    it('should throw ACCOUNT_DISABLED error', async () => {
      // ARRANGE
      const email = 'disabled@triptracking.com.br';
      const password = 'anyPassword123';

      // 📌 EXPLICAÇÃO 5: Mock de usuário desativado
      const mockUser = {
        isActive: () => false, // Conta desativada
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      // ACT & ASSERT
      await expect(useCase.execute(email, password)).rejects.toThrow(
        'ACCOUNT_DISABLED',
      );

      // 📌 EXPLICAÇÃO 6: Parou na verificação de conta ativa
      expect(mockUserRepository.findByEmail).toHaveBeenCalled();
      // Não deve verificar senha nem gerar token
    });
  });

  // 🧪 TESTE 4: Senha incorreta
  describe('when signing in with wrong password', () => {
    it('should throw INVALID_CREDENTIALS error', async () => {
      // ARRANGE
      const email = 'mauricio@triptracking.com.br';
      const password = 'wrongPassword';

      // 📌 EXPLICAÇÃO 7: Usuário ativo mas senha incorreta
      const mockUser = {
        isActive: () => true,
        verifyPassword: jest.fn().mockResolvedValue(false), // Senha incorreta
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      // ACT & ASSERT
      await expect(useCase.execute(email, password)).rejects.toThrow(
        'INVALID_CREDENTIALS',
      );

      // 📌 EXPLICAÇÃO 8: Passou por todas as validações até a senha
      expect(mockUserRepository.findByEmail).toHaveBeenCalled();
      expect(mockUser.verifyPassword).toHaveBeenCalledWith(password);
      // Não deve gerar token
      expect(mockJwtAuthService.generateAccessToken).not.toHaveBeenCalled();
    });
  });

  // 🧪 TESTE 5: Validação de email inválido
  describe('when signing in with invalid email', () => {
    it('should throw error from Email validation', async () => {
      // ARRANGE
      const email = 'invalid-email';
      const password = 'anyPassword123';

      // ACT & ASSERT
      // 📌 EXPLICAÇÃO 9: Email VO vai lançar erro antes de qualquer coisa
      await expect(useCase.execute(email, password)).rejects.toThrow(
        'E-mail inválido',
      ); // Ou a mensagem específica do Email VO
    });
  });

  // 🧪 TESTE 6: Fluxo completo de erro priorizado
  describe('error priority', () => {
    it('should check user existence before account status', async () => {
      // 📌 EXPLICAÇÃO 10: A ordem das verificações importa!
      const email = 'nope@triptracking.com.br';
      const password = 'anyPassword123';

      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(useCase.execute(email, password)).rejects.toThrow(
        'INVALID_CREDENTIALS',
      ); // Não "ACCOUNT_DISABLED"
    });

    it('should check account status before password', async () => {
      const email = 'disabled@triptracking.com.br';
      const password = 'anyPassword123';

      const mockUser = {
        isActive: () => false, // Desativado
        verifyPassword: jest.fn(), // Nem deve ser chamado
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(useCase.execute(email, password)).rejects.toThrow(
        'ACCOUNT_DISABLED',
      );

      expect(mockUser.verifyPassword).not.toHaveBeenCalled();
    });
  });

  describe('when user has invalid ID', () => {
    it('should handle ID conversion correctly', async () => {
      // ARRANGE
      const email = 'test@example.com';
      const password = 'correctPassword';

      const mockUser = {
        getId: () => new UserId(0), // ID temporário
        isActive: () => true,
        verifyPassword: jest.fn().mockResolvedValue(true),
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockJwtAuthService.generateAccessToken.mockResolvedValue('token');

      // ACT
      const result = await useCase.execute(email, password);

      // ASSERT
      expect(result.userId).toBe(0);
    });
  });
});

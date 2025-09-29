import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { SignUpUseCase } from '../../../application/use-cases/signup.use-case';
import { SignInUseCase } from '../../../application/use-cases/signin.use-case';
import { ForgotPasswordUseCase } from '../../../application/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from '../../../application/use-cases/reset-password.use-case';
import {
  SignUpRequestDto,
  SignInRequestDto,
  ForgotPasswordRequestDto,
  ResetPasswordRequestDto,
  AuthResponseDto,
} from '../../dtos';

describe('AuthController', () => {
  let controller: AuthController;
  let signUpUseCase: SignUpUseCase;
  let signInUseCase: SignInUseCase;
  let forgotPasswordUseCase: ForgotPasswordUseCase;
  let resetPasswordUseCase: ResetPasswordUseCase;

  const mockSignUpUseCase = {
    execute: jest.fn(),
  };

  const mockSignInUseCase = {
    execute: jest.fn(),
  };

  const mockForgotPasswordUseCase = {
    execute: jest.fn(),
  };

  const mockResetPasswordUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: SignUpUseCase,
          useValue: mockSignUpUseCase,
        },
        {
          provide: SignInUseCase,
          useValue: mockSignInUseCase,
        },
        {
          provide: ForgotPasswordUseCase,
          useValue: mockForgotPasswordUseCase,
        },
        {
          provide: ResetPasswordUseCase,
          useValue: mockResetPasswordUseCase,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    signUpUseCase = module.get<SignUpUseCase>(SignUpUseCase);
    signInUseCase = module.get<SignInUseCase>(SignInUseCase);
    forgotPasswordUseCase = module.get<ForgotPasswordUseCase>(
      ForgotPasswordUseCase,
    );
    resetPasswordUseCase =
      module.get<ResetPasswordUseCase>(ResetPasswordUseCase);

    jest.clearAllMocks();
  });

  describe('signUp', () => {
    it('deve criar usuário e retornar token de acesso', async () => {
      // Arrange
      const signUpDto: SignUpRequestDto = {
        name: 'Maurício',
        email: 'mauricio@triptracking.com.br',
        password: 'password123',
      };

      const expectedResult = {
        userId: 1,
        accessToken: 'jwt-token',
      };

      mockSignUpUseCase.execute.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.signUp(signUpDto);

      // Assert
      expect(result).toBeInstanceOf(AuthResponseDto);
      expect(result.access_token).toBe('jwt-token');
      expect(result.user_id).toBe(1);
      expect(result.email).toBe('mauricio@triptracking.com.br');
      expect(result.name).toBe('Maurício');

      expect(signUpUseCase.execute).toHaveBeenCalledWith({
        name: 'Maurício',
        email: 'mauricio@triptracking.com.br',
        password: 'password123',
      });
    });

    it('deve lidar com erro de email já existente', async () => {
      // Arrange
      const signUpDto: SignUpRequestDto = {
        name: 'Maurício',
        email: 'existing@triptracking.com.br',
        password: 'password123',
      };

      mockSignUpUseCase.execute.mockRejectedValue(
        new Error('EMAIL_ALREADY_EXISTS'),
      );

      // Act & Assert
      await expect(controller.signUp(signUpDto)).rejects.toThrow();

      expect(signUpUseCase.execute).toHaveBeenCalledWith(signUpDto);
    });
  });

  describe('signIn', () => {
    it('deve autenticar usuário e retornar token', async () => {
      // Arrange
      const signInDto: SignInRequestDto = {
        email: 'mauricio@triptracking.com.br',
        password: 'password123',
      };

      const expectedResult = {
        userId: 1,
        accessToken: 'jwt-token',
      };

      mockSignInUseCase.execute.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.signIn(signInDto);

      // Assert
      expect(result).toBeInstanceOf(AuthResponseDto);
      expect(result.access_token).toBe('jwt-token');
      expect(result.user_id).toBe(1);
      expect(result.email).toBe('mauricio@triptracking.com.br');

      expect(signInUseCase.execute).toHaveBeenCalledWith(
        'mauricio@triptracking.com.br',
        'password123',
      );
    });

    it('deve lidar com credenciais inválidas', async () => {
      // Arrange
      const signInDto: SignInRequestDto = {
        email: 'mauricio@triptracking.com.br',
        password: 'wrong-password',
      };

      mockSignInUseCase.execute.mockRejectedValue(
        new Error('INVALID_CREDENTIALS'),
      );

      // Act & Assert
      await expect(controller.signIn(signInDto)).rejects.toThrow();

      expect(signInUseCase.execute).toHaveBeenCalledWith(
        'mauricio@triptracking.com.br',
        'wrong-password',
      );
    });
  });

  describe('forgotPassword', () => {
    it('deve processar solicitação de reset de senha', async () => {
      // Arrange
      const forgotPasswordDto: ForgotPasswordRequestDto = {
        email: 'mauricio@triptracking.com.br',
      };

      const expectedResult = {
        message:
          'Se o email existir em nosso sistema, um link de redefinição será enviado',
      };

      mockForgotPasswordUseCase.execute.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.forgotPassword(forgotPasswordDto);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(forgotPasswordUseCase.execute).toHaveBeenCalledWith(
        'mauricio@triptracking.com.br',
      );
    });
  });

  describe('resetPassword', () => {
    it('deve redefinir senha com token válido', async () => {
      // Arrange
      const resetPasswordDto: ResetPasswordRequestDto = {
        token: 'valid-token',
        password: 'new-password123',
      };

      const expectedResult = {
        message: 'Senha redefinida com sucesso',
        details: 'Você já pode fazer login com sua nova senha',
      };

      mockResetPasswordUseCase.execute.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.resetPassword(resetPasswordDto);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(resetPasswordUseCase.execute).toHaveBeenCalledWith(
        'valid-token',
        'new-password123',
      );
    });

    it('deve lidar com token inválido', async () => {
      // Arrange
      const resetPasswordDto: ResetPasswordRequestDto = {
        token: 'invalid-token',
        password: 'new-password123',
      };

      mockResetPasswordUseCase.execute.mockRejectedValue(
        new Error('INVALID_TOKEN'),
      );

      // Act & Assert
      await expect(
        controller.resetPassword(resetPasswordDto),
      ).rejects.toThrow();

      expect(resetPasswordUseCase.execute).toHaveBeenCalledWith(
        'invalid-token',
        'new-password123',
      );
    });
  });

  describe('getProfile', () => {
    it('deve retornar perfil do usuário autenticado', () => {
      // Arrange
      const mockRequest = {
        user: {
          id: 1,
          email: 'mauricio@triptracking.com.br',
          name: 'Maurício',
        },
      };

      // Act
      const result = controller.getProfile(mockRequest);

      // Assert
      expect(result).toEqual({
        id: 1,
        email: 'mauricio@triptracking.com.br',
        name: 'Maurício',
      });
    });
  });

  describe('handleUseCaseError', () => {
    it('deve mapear EMAIL_ALREADY_EXISTS para ConflictException', async () => {
      mockSignUpUseCase.execute.mockRejectedValue(
        new Error('EMAIL_ALREADY_EXISTS'),
      );

      const signUpDto: SignUpRequestDto = {
        name: 'Maurício',
        email: 'existing@triptracking.com.br',
        password: 'password123',
      };

      // Act & Assert
      await expect(controller.signUp(signUpDto)).rejects.toThrow();
    });
  });
});

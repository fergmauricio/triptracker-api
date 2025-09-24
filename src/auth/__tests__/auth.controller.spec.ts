import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { QueueService } from '../../queue/queue.service';

import { SignUpDto } from '../dto/signup.dto';
import { SignInDto } from '../dto/signin.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import {
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

const mockUser = {
  id_user: 1,
  email: 'mauricioferg@gmail.com',
  name: 'Test Ferg',
};

const mockToken = {
  access_token:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoibWF1cmljaW9mZXJnQGdtYWlsLmNvbSIsIm5hbWUiOiJNYXVyw61jaW9vb28iLCJpYXQiOjE3NTg2Mzc4ODksImV4cCI6MTc1OTI0MjY4OX0.Oe6zTvbsXP08oA1xWzttYme_aUDkFh-xbCvsbNxkprk',
};

const mockRequest = {
  user: {
    sub: 1,
    email: 'mauricioferg@gmail.com',
    name: 'Test User',
  },
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let queueService: QueueService;

  const mockAuthService = {
    signUp: jest.fn(),
    signIn: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
  };

  const mockQueueService = {
    addEmailJob: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: QueueService,
          useValue: mockQueueService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    queueService = module.get<QueueService>(QueueService);

    jest.clearAllMocks();
  });

  describe('Controller Initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have authService injected', () => {
      expect(authService).toBeDefined();
    });

    it('should have queueService injected', () => {
      expect(queueService).toBeDefined();
    });
  });

  describe('POST /auth/signup', () => {
    const signUpDto: SignUpDto = {
      name: 'Test User',
      email: 'test@email.com',
      password: 'password123',
    };

    it('should successfully register a new user', async () => {
      // Arrange
      mockAuthService.signUp.mockResolvedValue(mockToken);

      // Act
      const result = await controller.signUp(signUpDto);

      // Assert
      expect(authService.signUp).toHaveBeenCalledWith(signUpDto);
      expect(authService.signUp).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockToken);
    });

    it('should throw BadRequestException when service throws BadRequestException', async () => {
      // Arrange
      const error = new BadRequestException('Dados inválidos');
      mockAuthService.signUp.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.signUp(signUpDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.signUp(signUpDto)).rejects.toThrow(
        'Dados inválidos',
      );
    });

    it('should throw ConflictException when email already exists', async () => {
      // Arrange
      const error = new ConflictException('Email já cadastrado');
      mockAuthService.signUp.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.signUp(signUpDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(controller.signUp(signUpDto)).rejects.toThrow(
        'Email já cadastrado',
      );
    });

    it('should pass complete signUpDto to service', async () => {
      // Arrange
      mockAuthService.signUp.mockResolvedValue(mockToken);

      // Act
      await controller.signUp(signUpDto);

      // Assert
      expect(authService.signUp).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@email.com',
        password: 'password123',
      });
    });
  });

  describe('POST /auth/signin', () => {
    const signInDto: SignInDto = {
      email: 'test@email.com',
      password: 'password123',
    };

    it('should successfully authenticate user', async () => {
      // Arrange
      mockAuthService.signIn.mockResolvedValue(mockToken);

      // Act
      const result = await controller.signIn(signInDto);

      // Assert
      expect(authService.signIn).toHaveBeenCalledWith(signInDto);
      expect(authService.signIn).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockToken);
    });

    it('should throw UnauthorizedException with invalid credentials', async () => {
      // Arrange
      const error = new UnauthorizedException('Credenciais inválidas');
      mockAuthService.signIn.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(controller.signIn(signInDto)).rejects.toThrow(
        'Credenciais inválidas',
      );
    });

    it('should handle empty credentials gracefully', async () => {
      // Arrange
      const emptySignInDto: SignInDto = { email: '', password: '' };
      const error = new BadRequestException('Email e senha são obrigatórios');
      mockAuthService.signIn.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.signIn(emptySignInDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('POST /auth/forgot-password', () => {
    const forgotPasswordDto: ForgotPasswordDto = {
      email: 'test@email.com',
    };

    it('should successfully process forgot password request', async () => {
      // Arrange
      const successResponse = { message: 'Email de reset enviado' };
      mockAuthService.forgotPassword.mockResolvedValue(successResponse);

      // Act
      const result = await controller.forgotPassword(forgotPasswordDto);

      // Assert
      expect(authService.forgotPassword).toHaveBeenCalledWith(
        forgotPasswordDto,
      );
      expect(result).toEqual(successResponse);
    });

    it('should handle non-existent email gracefully', async () => {
      // Arrange
      const successResponse = {
        message: 'Se o email existir, um link será enviado',
      };
      mockAuthService.forgotPassword.mockResolvedValue(successResponse);

      // Act
      const result = await controller.forgotPassword(forgotPasswordDto);

      // Assert
      expect(result.message).toContain('Se o email existir');
    });

    it('should throw BadRequestException with invalid email', async () => {
      // Arrange
      const error = new BadRequestException('Email inválido');
      mockAuthService.forgotPassword.mockRejectedValue(error);

      // Act & Assert
      await expect(
        controller.forgotPassword(forgotPasswordDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('POST /auth/reset-password', () => {
    const resetPasswordDto: ResetPasswordDto = {
      token: 'valid-reset-token',
      password: 'newpassword123',
    };

    it('should successfully reset password', async () => {
      // Arrange
      const successResponse = { message: 'Senha redefinida com sucesso' };
      mockAuthService.resetPassword.mockResolvedValue(successResponse);

      // Act
      const result = await controller.resetPassword(resetPasswordDto);

      // Assert
      expect(authService.resetPassword).toHaveBeenCalledWith(resetPasswordDto);
      expect(result).toEqual(successResponse);
    });

    it('should throw NotFoundException with invalid token', async () => {
      // Arrange
      const error = new NotFoundException('Token inválido');
      mockAuthService.resetPassword.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.resetPassword(resetPasswordDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException with weak password', async () => {
      // Arrange
      const weakPasswordDto = { ...resetPasswordDto, password: '123' };
      const error = new BadRequestException('Senha muito curta');
      mockAuthService.resetPassword.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.resetPassword(weakPasswordDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('GET /auth/profile', () => {
    it('should return user profile when authenticated', () => {
      // Act
      const result = controller.getProfile(mockRequest);

      // Assert
      expect(result).toEqual(mockRequest.user);
      expect(result.sub).toBe(1);
      expect(result.email).toBe('mauricioferg@gmail.com');
    });

    it('should return user object with expected properties', () => {
      // Act
      const result = controller.getProfile(mockRequest);

      // Assert
      expect(result).toHaveProperty('sub');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('name');
    });

    it('should work with different user objects', () => {
      // Arrange
      const differentUser = {
        user: {
          sub: 2,
          email: 'other@email.com',
          name: 'Other User',
        },
      };

      // Act
      const result = controller.getProfile(differentUser);

      // Assert
      expect(result.sub).toBe(2);
      expect(result.email).toBe('other@email.com');
    });
  });

  describe('Error Handling', () => {
    const signInDto: SignInDto = {
      email: 'test@email.com',
      password: 'password123',
    };

    it('should propagate service errors without modification', async () => {
      // Arrange
      const error = new BadRequestException('Test error');
      mockAuthService.signIn.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.signIn(signInDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.signIn(signInDto)).rejects.toThrow('Test error');
    });

    it('should handle unexpected errors gracefully', async () => {
      // Arrange
      const error = new Error('Unexpected error');
      mockAuthService.signIn.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.signIn(signInDto)).rejects.toThrow(Error);
      await expect(controller.signIn(signInDto)).rejects.toThrow(
        'Unexpected error',
      );
    });
  });
});

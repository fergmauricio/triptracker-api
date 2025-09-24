import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { QueueService } from '../../queue/queue.service';
import { SignUpDto } from '../dto/signup.dto';
import { SignInDto } from '../dto/signin.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

// Mock bcrypt
jest.mock('bcryptjs');
jest.mock('crypto');

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let queueService: QueueService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    password_reset_tokens: {
      findUnique: jest.fn(),
      deleteMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockQueueService = {
    addEmailJob: jest.fn(),
  };

  const mockUser = {
    id_user: 1,
    email: 'test@email.com',
    name: 'Test User',
    password: 'hashedpassword',
    active: true,
  };

  const mockToken = {
    access_token: 'mock-jwt-token',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: QueueService,
          useValue: mockQueueService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    queueService = module.get<QueueService>(QueueService);

    jest.clearAllMocks();
    (bcrypt.hash as jest.Mock).mockClear();
    (bcrypt.compare as jest.Mock).mockClear();
    (crypto.randomBytes as jest.Mock).mockClear();
  });

  describe('signUp', () => {
    const signUpDto: SignUpDto = {
      name: 'Test User',
      email: 'test@email.com',
      password: 'password123',
    };

    it('should successfully register a new user', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('mock-jwt-token');

      // Act
      const result = await service.signUp(signUpDto);

      // Assert
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@email.com' },
        select: { id_user: true },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@email.com',
          name: 'Test User',
          password: 'hashedpassword',
        },
      });
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: 1,
        email: 'test@email.com',
        name: 'Test User',
      });
      expect(result).toEqual({ access_token: 'mock-jwt-token' });
    });

    it('should throw BadRequestException when required fields are missing', async () => {
      // Arrange
      const invalidDto = { name: '', email: '', password: '' };

      // Act & Assert
      await expect(service.signUp(invalidDto as SignUpDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when password is too short', async () => {
      // Arrange
      const shortPasswordDto = { ...signUpDto, password: '123' };

      // Act & Assert
      await expect(service.signUp(shortPasswordDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when email is invalid', async () => {
      // Arrange
      const invalidEmailDto = { ...signUpDto, email: 'invalid-email' };

      // Act & Assert
      await expect(service.signUp(invalidEmailDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException when email already exists', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue({ id_user: 1 });

      // Act & Assert
      await expect(service.signUp(signUpDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw InternalServerErrorException on database error', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockRejectedValue(
        new Error('DB Error'),
      );

      // Act & Assert
      await expect(service.signUp(signUpDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('signIn', () => {
    const signInDto: SignInDto = {
      email: 'test@email.com',
      password: 'password123',
    };

    it('should successfully authenticate user', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('mock-jwt-token');

      // Act
      const result = await service.signIn(signInDto);

      // Assert
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@email.com' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashedpassword',
      );
      expect(result).toEqual({ access_token: 'mock-jwt-token' });
    });

    it('should throw BadRequestException when credentials are missing', async () => {
      // Arrange
      const invalidDto = { email: '', password: '' };

      // Act & Assert
      await expect(service.signIn(invalidDto as SignInDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      // Arrange
      const inactiveUser = { ...mockUser, active: false };
      mockPrismaService.user.findUnique.mockResolvedValue(inactiveUser);

      // Act & Assert
      await expect(service.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(service.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('forgotPassword', () => {
    const forgotPasswordDto: ForgotPasswordDto = {
      email: 'test@email.com',
    };

    it('should process forgot password for existing user', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (crypto.randomBytes as jest.Mock).mockReturnValue({
        toString: () => 'reset-token',
      });
      mockPrismaService.password_reset_tokens.deleteMany.mockResolvedValue({});
      mockPrismaService.password_reset_tokens.create.mockResolvedValue({});
      mockQueueService.addEmailJob.mockResolvedValue({});

      // Act
      const result = await service.forgotPassword(forgotPasswordDto);

      // Assert
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@email.com' },
      });
      expect(prismaService.password_reset_tokens.deleteMany).toHaveBeenCalled();
      expect(prismaService.password_reset_tokens.create).toHaveBeenCalled();
      expect(queueService.addEmailJob).toHaveBeenCalled();
      expect(result.message).toContain('Se o email existir');
    });

    it('should return success message for non-existent user (security)', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.forgotPassword(forgotPasswordDto);

      // Assert
      expect(result.message).toContain('Se o email existir');
      expect(prismaService.password_reset_tokens.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when email is missing', async () => {
      // Arrange
      const invalidDto = { email: '' };

      // Act & Assert
      await expect(
        service.forgotPassword(invalidDto as ForgotPasswordDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when email is invalid', async () => {
      // Arrange
      const invalidDto = { email: 'invalid-email' };

      // Act & Assert
      await expect(
        service.forgotPassword(invalidDto as ForgotPasswordDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('resetPassword', () => {
    const resetPasswordDto: ResetPasswordDto = {
      token: 'valid-token',
      password: 'newpassword123',
    };

    const mockResetToken = {
      id: 1,
      token: 'valid-token',
      user_id: 1,
      expires_at: new Date(Date.now() + 3600000), // 1 hour from now
      user: mockUser,
    };

    it('should successfully reset password', async () => {
      // Arrange
      mockPrismaService.password_reset_tokens.findUnique.mockResolvedValue(
        mockResetToken,
      );
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-password');
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(mockPrismaService);
      });

      // Act
      const result = await service.resetPassword(resetPasswordDto);

      // Assert
      expect(
        prismaService.password_reset_tokens.findUnique,
      ).toHaveBeenCalledWith({
        where: { token: 'valid-token' },
        include: { user: true },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', 10);
      expect(prismaService.$transaction).toHaveBeenCalled();
      expect(result.message).toBe('Senha redefinida com sucesso');
    });

    it('should throw BadRequestException when required fields are missing', async () => {
      // Arrange
      const invalidDto = { token: '', password: '' };

      // Act & Assert
      await expect(
        service.resetPassword(invalidDto as ResetPasswordDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when password is too short', async () => {
      // Arrange
      const shortPasswordDto = { ...resetPasswordDto, password: '123' };

      // Act & Assert
      await expect(service.resetPassword(shortPasswordDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when token is invalid', async () => {
      // Arrange
      mockPrismaService.password_reset_tokens.findUnique.mockResolvedValue(
        null,
      );

      // Act & Assert
      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when token is expired', async () => {
      // Arrange
      const expiredToken = {
        ...mockResetToken,
        expires_at: new Date(Date.now() - 3600000), // 1 hour ago
      };
      mockPrismaService.password_reset_tokens.findUnique.mockResolvedValue(
        expiredToken,
      );

      // Act & Assert
      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email formats', () => {
      expect(service['isValidEmail']('test@email.com')).toBe(true);
      expect(service['isValidEmail']('user.name@domain.co.uk')).toBe(true);
    });

    it('should invalidate incorrect email formats', () => {
      expect(service['isValidEmail']('invalid-email')).toBe(false);
      expect(service['isValidEmail']('@domain.com')).toBe(false);
      expect(service['isValidEmail']('user@')).toBe(false);
    });
  });
});

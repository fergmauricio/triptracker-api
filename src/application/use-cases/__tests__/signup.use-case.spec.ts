import { SignUpUseCase } from '../signup.use-case';
import { SignUpCommand } from '../../commands/signup-command';
import { User } from '../../../domain/entities/user.entity';
import { Email } from '../../../domain/value-objects/email.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';

jest.mock('../../../domain/entities/user.entity');
jest.mock('../../../infrastructure/adapters/auth/jwt.service');

describe('SignUpUseCase', () => {
  let useCase: SignUpUseCase;
  let mockUserRepository: any;
  let mockJwtAuthService: any;
  let mockEventPublisher: any;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      save: jest.fn(),
    };

    mockJwtAuthService = {
      generateAccessToken: jest.fn(),
    };

    mockEventPublisher = {
      publish: jest.fn(),
    };

    useCase = new SignUpUseCase(
      mockUserRepository,
      mockJwtAuthService,
      mockEventPublisher,
    );

    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('when signing up with valid data', () => {
    it('should create user successfully and return access token', async () => {
      // ARRANGE
      const command = new SignUpCommand(
        'Mauricio',
        'john@example.com',
        'securePassword123',
      );

      mockUserRepository.findByEmail.mockResolvedValue(null);

      const mockUser = {
        getId: () => new UserId(123),
        getDomainEvents: () => [{ getEventName: () => 'UserRegisteredEvent' }],
        clearDomainEvents: jest.fn(),
      };
      (User.create as jest.Mock).mockResolvedValue(mockUser);

      mockJwtAuthService.generateAccessToken.mockResolvedValue('jwt_token_123');

      mockUserRepository.save.mockResolvedValue(undefined);

      // ACT
      const result = await useCase.execute(command);

      // ASSERT
      expect(result).toEqual({
        userId: 123,
        accessToken: 'jwt_token_123',
      });

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        expect.any(Email),
      );

      expect(User.create).toHaveBeenCalledWith(
        'Mauricio',
        expect.any(Email),
        'securePassword123',
      );

      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
      expect(mockJwtAuthService.generateAccessToken).toHaveBeenCalledWith(
        mockUser,
      );
      expect(mockEventPublisher.publish).toHaveBeenCalledWith(
        expect.objectContaining({ getEventName: expect.any(Function) }),
      );
    });
  });

  describe('when signing up with duplicate email', () => {
    it('should throw EMAIL_ALREADY_EXISTS error', async () => {
      // ARRANGE
      const command = new SignUpCommand(
        'Mauricio',
        'teste@triptracking.com.br',
        'password123',
      );

      const existingUser = {
        getId: () => new UserId(456),
        getEmail: () => new Email('teste@triptracking.com.br'),
      };
      mockUserRepository.findByEmail.mockResolvedValue(existingUser);

      // ACT & ASSERT
      await expect(useCase.execute(command)).rejects.toThrow(
        'EMAIL_ALREADY_EXISTS',
      );

      expect(User.create).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
      expect(mockJwtAuthService.generateAccessToken).not.toHaveBeenCalled();
    });
  });

  describe('when creating user', () => {
    it('should publish domain events correctly', async () => {
      // ARRANGE
      const command = new SignUpCommand(
        'Jane Doe',
        'jane@example.com',
        'password123',
      );

      mockUserRepository.findByEmail.mockResolvedValue(null);

      const mockEvents = [
        { getEventName: () => 'UserRegisteredEvent' },
        { getEventName: () => 'WelcomeEmailEvent' },
      ];

      const mockUser = {
        getId: () => new UserId(789),
        getDomainEvents: () => mockEvents,
        clearDomainEvents: jest.fn(),
      };
      (User.create as jest.Mock).mockResolvedValue(mockUser);

      mockJwtAuthService.generateAccessToken.mockResolvedValue('token');
      mockUserRepository.save.mockResolvedValue(undefined);

      // ACT
      await useCase.execute(command);

      // ASSERT

      expect(mockEventPublisher.publish).toHaveBeenCalledTimes(
        mockEvents.length,
      );
      expect(mockUser.clearDomainEvents).toHaveBeenCalled();
    });
  });

  describe('when command has invalid data', () => {
    it('should propagate errors from Email validation', async () => {
      // ARRANGE
      const command = new SignUpCommand('John', 'invalid-email', 'password123');

      mockUserRepository.findByEmail.mockResolvedValue(null);

      // ACT & ASSERT
      await expect(useCase.execute(command)).rejects.toThrow(
        'E-mail inválido.',
      );
    });

    it('should propagate errors from User.create', async () => {
      //
      const command = new SignUpCommand(
        'J',
        'valid@triptracking.com.br',
        'password123',
      );

      mockUserRepository.findByEmail.mockResolvedValue(null);

      (User.create as jest.Mock).mockRejectedValue(
        new Error('Name must be at least 2 characters long'),
      );

      // ACT & ASSERT
      await expect(useCase.execute(command)).rejects.toThrow(
        'Name must be at least 2 characters long',
      );
    });
  });
});

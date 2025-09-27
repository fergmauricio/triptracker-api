import { User } from '../user.entity';
import { Email } from '../../value-objects/email.vo';
import { PasswordHash } from '../../value-objects/password-hash.vo';
import { UserRegisteredEvent } from '../../domain-events/user-registered.event';

jest.mock('../../value-objects/password-hash.vo');

describe('User Entity', () => {
  const mockValidData = {
    name: 'John Doe',
    email: new Email('john@example.com'),
    password: 'securePassword123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when creating a new user', () => {
    it('should create user with valid data', async () => {
      const mockPasswordHash = {
        getValue: () => 'hashed_password',
        verify: jest.fn(),
      };
      (PasswordHash.create as jest.Mock).mockResolvedValue(mockPasswordHash);

      // ACT
      const user = await User.create(
        mockValidData.name,
        mockValidData.email,
        mockValidData.password,
      );

      // ASSERT
      expect(user.getName()).toBe(mockValidData.name);
      expect(user.getEmail().getValue()).toBe('john@example.com');
      expect(user.isActive()).toBe(true);
      expect(PasswordHash.create).toHaveBeenCalledWith(mockValidData.password);
    });

    it('should throw error for short name', async () => {
      await expect(
        User.create('A', mockValidData.email, 'password'),
      ).rejects.toThrow('Name must be at least 2 characters long');
    });

    it('should throw error for empty name', async () => {
      await expect(
        User.create('', mockValidData.email, 'password'),
      ).rejects.toThrow('Name must be at least 2 characters long');
    });

    it('should add UserRegisteredEvent to domain events', async () => {
      const mockPasswordHash = { getValue: () => 'hashed', verify: jest.fn() };
      (PasswordHash.create as jest.Mock).mockResolvedValue(mockPasswordHash);

      const user = await User.create(
        mockValidData.name,
        mockValidData.email,
        mockValidData.password,
      );

      const events = user.getDomainEvents();

      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(UserRegisteredEvent);
      expect(events[0].getEventName()).toBe('UserRegisteredEvent');
    });

    it('should have temporary ID for new user', async () => {
      const mockPasswordHash = { getValue: () => 'hashed', verify: jest.fn() };
      (PasswordHash.create as jest.Mock).mockResolvedValue(mockPasswordHash);

      const user = await User.create(
        mockValidData.name,
        mockValidData.email,
        mockValidData.password,
      );

      expect(user.getId().isTemporary()).toBe(true);
      expect(user.getId().getValue()).toBe(0);
    });
  });

  describe('when recreating from persistence', () => {
    it('should create user with existing ID', () => {
      const user = User.fromPersistence(
        123, // ID existente
        'Jane Doe',
        'jane@example.com',
        'pre_hashed_password',
        true,
        'avatar_url.jpg',
      );

      expect(user.getId().isTemporary()).toBe(false);
      expect(user.getId().getValue()).toBe(123);
      expect(user.getName()).toBe('Jane Doe');
      expect(user.getAvatarUrl()).toBe('avatar_url.jpg');
    });

    it('should create user without avatar if not provided', () => {
      const user = User.fromPersistence(
        456,
        'Bob Smith',
        'bob@example.com',
        'pre_hashed_password',
        true,
      );

      expect(user.getAvatarUrl()).toBeNull();
    });
  });

  describe('when updating avatar', () => {
    it('should update avatar URL', async () => {
      const mockPasswordHash = { getValue: () => 'hashed', verify: jest.fn() };
      (PasswordHash.create as jest.Mock).mockResolvedValue(mockPasswordHash);

      const user = await User.create(
        mockValidData.name,
        mockValidData.email,
        mockValidData.password,
      );

      user.updateAvatar('teste/avatar.jpg');

      expect(user.getAvatarUrl()).toBe('teste/avatar.jpg');
    });
  });

  describe('when changing name', () => {
    it('should update name with valid data', async () => {
      const mockPasswordHash = { getValue: () => 'hashed', verify: jest.fn() };
      (PasswordHash.create as jest.Mock).mockResolvedValue(mockPasswordHash);

      const user = await User.create(
        mockValidData.name,
        mockValidData.email,
        mockValidData.password,
      );

      user.changeName('Novo Nome');

      expect(user.getName()).toBe('Novo Nome');
    });

    it('should throw error for invalid name', async () => {
      const mockPasswordHash = { getValue: () => 'hashed', verify: jest.fn() };
      (PasswordHash.create as jest.Mock).mockResolvedValue(mockPasswordHash);

      const user = await User.create(
        mockValidData.name,
        mockValidData.email,
        mockValidData.password,
      );

      expect(() => user.changeName('A')).toThrow(
        'O Nome precisa ter no mínimo 2 caracteres',
      );
    });
  });

  describe('when changing password', () => {
    it('should update password when current password is correct', async () => {
      const mockOldPasswordHash = {
        getValue: () => 'old_hashed',
        verify: jest.fn().mockResolvedValue(true),
      };

      const mockNewPasswordHash = {
        getValue: () => 'new_hashed',
        verify: jest.fn(),
      };

      (PasswordHash.create as jest.Mock)
        .mockResolvedValueOnce(mockOldPasswordHash) // Primeira chamada (create)
        .mockResolvedValueOnce(mockNewPasswordHash); // Segunda chamada (changePassword)

      const user = await User.create(
        mockValidData.name,
        mockValidData.email,
        mockValidData.password,
      );

      await user.changePassword('currentPassword', 'newPassword');

      expect(mockOldPasswordHash.verify).toHaveBeenCalledWith(
        'currentPassword',
      );
      expect(PasswordHash.create).toHaveBeenCalledWith('newPassword');
    });

    it('should throw error when current password is incorrect', async () => {
      const mockPasswordHash = {
        getValue: () => 'hashed',
        verify: jest.fn().mockResolvedValue(false),
      };
      (PasswordHash.create as jest.Mock).mockResolvedValue(mockPasswordHash);

      const user = await User.create(
        mockValidData.name,
        mockValidData.email,
        mockValidData.password,
      );

      await expect(
        user.changePassword('wrongPassword', 'newPassword'),
      ).rejects.toThrow('Senha incorreta');
    });
  });

  describe('when managing activation status', () => {
    it('should deactivate user', async () => {
      const mockPasswordHash = { getValue: () => 'hashed', verify: jest.fn() };
      (PasswordHash.create as jest.Mock).mockResolvedValue(mockPasswordHash);

      const user = await User.create(
        mockValidData.name,
        mockValidData.email,
        mockValidData.password,
      );

      user.deactivate();

      expect(user.isActive()).toBe(false);
    });

    it('should activate user', async () => {
      const mockPasswordHash = { getValue: () => 'hashed', verify: jest.fn() };
      (PasswordHash.create as jest.Mock).mockResolvedValue(mockPasswordHash);

      const user = await User.create(
        mockValidData.name,
        mockValidData.email,
        mockValidData.password,
      );

      user.deactivate();
      user.activate();

      expect(user.isActive()).toBe(true);
    });
  });

  describe('when verifying password', () => {
    it('should return true for correct password', async () => {
      const mockPasswordHash = {
        getValue: () => 'hashed',
        verify: jest.fn().mockResolvedValue(true),
      };
      (PasswordHash.create as jest.Mock).mockResolvedValue(mockPasswordHash);

      const user = await User.create(
        mockValidData.name,
        mockValidData.email,
        mockValidData.password,
      );

      const isValid = await user.verifyPassword('correctPassword');

      expect(isValid).toBe(true);
      expect(mockPasswordHash.verify).toHaveBeenCalledWith('correctPassword');
    });
  });

  describe('when managing domain events', () => {
    it('should clear domain events', async () => {
      const mockPasswordHash = { getValue: () => 'hashed', verify: jest.fn() };
      (PasswordHash.create as jest.Mock).mockResolvedValue(mockPasswordHash);

      const user = await User.create(
        mockValidData.name,
        mockValidData.email,
        mockValidData.password,
      );

      expect(user.getDomainEvents()).toHaveLength(1);

      user.clearDomainEvents();

      expect(user.getDomainEvents()).toHaveLength(0);
    });

    it('should add custom domain events', async () => {
      const mockPasswordHash = { getValue: () => 'hashed', verify: jest.fn() };
      (PasswordHash.create as jest.Mock).mockResolvedValue(mockPasswordHash);

      const user = await User.create(
        mockValidData.name,
        mockValidData.email,
        mockValidData.password,
      );

      user.clearDomainEvents();

      const customEvent = {
        occurredOn: new Date(),
        getEventName: () => 'CustomEvent',
      } as any;

      user.addDomainEvent(customEvent);

      expect(user.getDomainEvents()).toHaveLength(1);
      expect(user.getDomainEvents()[0].getEventName()).toBe('CustomEvent');
    });
  });
});

import { User } from '../user.entity';
import { Email } from '../../value-objects/email.vo';
import { PasswordHash } from '../../value-objects/password-hash.vo';
import { UserRegisteredEvent } from '../../domain-events/user-registered.event';

jest.mock('../../value-objects/password-hash.vo');

describe('User Entity', () => {
  const mockValidData = {
    name: 'Mauricio',
    email: new Email('mauricio@triptracking.com.br'),
    password: 'securePassword123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Ao criar novo usuário', () => {
    it('Deve criar usuário com dados válidos', async () => {
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
      expect(user.getEmail().getValue()).toBe('mauricio@triptracking.com.br');
      expect(user.isActive()).toBe(true);
      expect(PasswordHash.create).toHaveBeenCalledWith(mockValidData.password);
    });

    it('Deve gerar erro para nome curto', async () => {
      await expect(
        User.create('A', mockValidData.email, 'password'),
      ).rejects.toThrow('Name must be at least 2 characters long');
    });

    it('Deve gerar erro para nome vazio', async () => {
      await expect(
        User.create('', mockValidData.email, 'password'),
      ).rejects.toThrow('Name must be at least 2 characters long');
    });

    it('Deve adicionar UserRegisteredEvent ao domain events', async () => {
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

    it('Deve ter um ID temporário para novos usuários', async () => {
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

  describe('Ao recriar a partir da persistência', () => {
    it('Deve criar um usuário com ID existente', () => {
      const user = User.fromPersistence(
        123, // ID existente
        'Joana',
        'joana@triptracking.com.br',
        'pre_hashed_password',
        true,
        'avatar_url.jpg',
      );

      expect(user.getId().isTemporary()).toBe(false);
      expect(user.getId().getValue()).toBe(123);
      expect(user.getName()).toBe('Joana');
      expect(user.getAvatarUrl()).toBe('avatar_url.jpg');
    });

    it('deve criar usuário sem o campo avatar preenchido', () => {
      const user = User.fromPersistence(
        456,
        'Laís',
        'lais@triptracking.com.br',
        'pre_hashed_password',
        true,
      );

      expect(user.getAvatarUrl()).toBeNull();
    });
  });

  describe('Quando mudar o avatar', () => {
    it('deve fazer update na URL do avatar', async () => {
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

  describe('Quando mudar o nome', () => {
    it('deve editar o nome com dados válidos', async () => {
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

    it('Deve gerar erro para nomes inválidos', async () => {
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

  describe('Quando alterar a senha', () => {
    it('Deve atualizar a senha quando a senha atual estiver correta', async () => {
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

    it('Deve gerar erro quando a senha atual estiver incorreta', async () => {
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

  describe('Ao gerenciar o status de ativação', () => {
    it('Deve desativar o usuário', async () => {
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

    it('Deve ativar o usuário', async () => {
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

  describe('Ao verificar senha', () => {
    it('Deve retornar true para senha correta', async () => {
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

  describe('Quando gerenciar domain events', () => {
    it('Deve limpar domain events', async () => {
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

    it('Deve adicionar um custom domain events', async () => {
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

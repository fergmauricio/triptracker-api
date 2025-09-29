import { PasswordResetToken } from '../password-reset-token.entity';
import { UserId } from '../../value-objects/user-id.vo';
import { DomainEvent } from '../../domain-events/domain-event';

jest.mock('crypto', () => ({
  randomBytes: jest.fn().mockReturnValue(Buffer.from('mocked_token_value')),
}));

describe('Entidade PasswordResetToken', () => {
  const mockUserId = new UserId(123);

  const now = new Date('2024-01-01T10:00:00Z');
  const oneHourLater = new Date('2024-01-01T11:00:00Z');
  const oneHourEarlier = new Date('2024-01-01T09:00:00Z');

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(now);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('ao criar um novo token', () => {
    it('deve criar token com expiração padrão (1 hora)', () => {
      // ACT
      const token = PasswordResetToken.create(mockUserId);

      // ASSERT
      expect(token.getUserId().equals(mockUserId)).toBe(true);
      expect(token.getExpiresAt()).toEqual(oneHourLater);
      expect(token.getToken()).toBe('6d6f636b65645f746f6b656e5f76616c7565');
      expect(token.isValid()).toBe(true);
      expect(token.isExpired()).toBe(false);
    });

    it('deve criar token com tempo de expiração customizado', () => {
      // ACT: Token com expiração de 2 horas
      const token = PasswordResetToken.create(mockUserId, 2);
      const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

      // ASSERT
      expect(token.getExpiresAt()).toEqual(twoHoursLater);
    });

    it('deve ter ID temporário para novo token', () => {
      const token = PasswordResetToken.create(mockUserId);

      expect(token.getId()).toBe(0); // ID 0 indica token não persistido
    });
  });

  describe('ao verificar expiração do token', () => {
    it('deve ser válido se não expirado', () => {
      const token = new PasswordResetToken(
        1,
        'test_token',
        mockUserId,
        oneHourLater,
        now,
      );

      expect(token.isValid()).toBe(true);
      expect(token.isExpired()).toBe(false);
    });

    it('deve estar expirado se após a data de expiração', () => {
      const token = new PasswordResetToken(
        1,
        'test_token',
        mockUserId,
        oneHourEarlier,
        oneHourEarlier,
      );

      expect(token.isValid()).toBe(false);
      expect(token.isExpired()).toBe(true);
    });

    it('deve estar expirado exatamente no tempo de expiração', () => {
      const token = new PasswordResetToken(
        1,
        'test_token',
        mockUserId,
        now,
        oneHourEarlier,
      );

      expect(token.isValid()).toBe(false);
      expect(token.isExpired()).toBe(true);
    });
  });

  describe('ao verificar propriedade do token', () => {
    it('deve retornar true para ID de usuário correspondente', () => {
      const token = PasswordResetToken.create(mockUserId);
      const sameUserId = new UserId(123);

      expect(token.belongsToUser(sameUserId)).toBe(true);
    });

    it('deve retornar false para ID de usuário diferente', () => {
      const token = PasswordResetToken.create(mockUserId);
      const differentUserId = new UserId(456);

      expect(token.belongsToUser(differentUserId)).toBe(false);
    });
  });

  describe('ao criar a partir de dados existentes', () => {
    it('deve criar token com os dados fornecidos', () => {
      const existingToken = new PasswordResetToken(
        1, // ID existente
        'existing_token',
        mockUserId,
        oneHourLater,
        oneHourEarlier,
      );

      expect(existingToken.getId()).toBe(1);
      expect(existingToken.getToken()).toBe('existing_token');
      expect(existingToken.getCreatedAt()).toEqual(oneHourEarlier);
      expect(existingToken.getExpiresAt()).toEqual(oneHourLater);
    });
  });

  describe('ao gerenciar eventos de domínio', () => {
    it('deve adicionar e recuperar eventos de domínio', () => {
      const token = PasswordResetToken.create(mockUserId);

      const mockEvent: DomainEvent = {
        occurredOn: now,
        getEventName: () => 'TestEvent',
      };

      token.addDomainEvent(mockEvent);

      const events = token.getDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0].getEventName()).toBe('TestEvent');
    });

    it('deve limpar eventos de domínio', () => {
      const token = PasswordResetToken.create(mockUserId);

      const mockEvent: DomainEvent = {
        occurredOn: now,
        getEventName: () => 'TestEvent',
      };

      token.addDomainEvent(mockEvent);
      expect(token.getDomainEvents()).toHaveLength(1);

      token.clearDomainEvents();
      expect(token.getDomainEvents()).toHaveLength(0);
    });
  });

  describe('casos extremos e validações', () => {
    it('deve lidar com token com expiração muito longa', () => {
      const token = PasswordResetToken.create(mockUserId, 24 * 365); // 1 ano
      const oneYearLater = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

      expect(token.getExpiresAt().getTime()).toBeCloseTo(
        oneYearLater.getTime(),
        -3,
      );
    });

    it('deve lidar com token com expiração imediata', () => {
      const token = PasswordResetToken.create(mockUserId, 0);

      expect(token.isExpired()).toBe(true);
    });

    it('deve ter data createdAt consistente', () => {
      const token = PasswordResetToken.create(mockUserId);

      expect(token.getCreatedAt().getTime()).toBeCloseTo(now.getTime(), -3);
    });
  });

  describe('igualdade através do ID do usuário', () => {
    it('deve ser igual para mesmos valores de ID de usuário', () => {
      const token1 = PasswordResetToken.create(new UserId(123));
      const token2 = PasswordResetToken.create(new UserId(123));

      expect(token1.getUserId().equals(token2.getUserId())).toBe(true);
    });

    it('deve ser diferente para valores diferentes de ID de usuário', () => {
      const token1 = PasswordResetToken.create(new UserId(123));
      const token2 = PasswordResetToken.create(new UserId(456));

      expect(token1.getUserId().equals(token2.getUserId())).toBe(false);
    });
  });
});

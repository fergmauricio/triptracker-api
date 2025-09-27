import { PasswordResetToken } from '../password-reset-token.entity';
import { UserId } from '../../value-objects/user-id.vo';
import { DomainEvent } from '../../domain-events/domain-event';

jest.mock('crypto', () => ({
  randomBytes: jest.fn().mockReturnValue(Buffer.from('mocked_token_value')),
}));

describe('PasswordResetToken Entity', () => {
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

  describe('when creating a new token', () => {
    it('should create token with default expiration (1 hour)', () => {
      // ACT
      const token = PasswordResetToken.create(mockUserId);

      // ASSERT
      expect(token.getUserId().equals(mockUserId)).toBe(true);
      expect(token.getExpiresAt()).toEqual(oneHourLater);
      expect(token.getToken()).toBe('6d6f636b65645f746f6b656e5f76616c7565');
      expect(token.isValid()).toBe(true);
      expect(token.isExpired()).toBe(false);
    });

    it('should create token with custom expiration time', () => {
      // ACT: Token com expiração de 2 horas
      const token = PasswordResetToken.create(mockUserId, 2);
      const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

      // ASSERT
      expect(token.getExpiresAt()).toEqual(twoHoursLater);
    });

    it('should have temporary ID for new token', () => {
      const token = PasswordResetToken.create(mockUserId);

      expect(token.getId()).toBe(0); // ID 0 indica token não persistido
    });
  });

  describe('when checking token expiration', () => {
    it('should be valid if not expired', () => {
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

    it('should be expired if past expiration date', () => {
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

    it('should be expired exactly at expiration time', () => {
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

  describe('when checking token ownership', () => {
    it('should return true for matching user ID', () => {
      const token = PasswordResetToken.create(mockUserId);
      const sameUserId = new UserId(123);

      expect(token.belongsToUser(sameUserId)).toBe(true);
    });

    it('should return false for different user ID', () => {
      const token = PasswordResetToken.create(mockUserId);
      const differentUserId = new UserId(456);

      expect(token.belongsToUser(differentUserId)).toBe(false);
    });
  });

  describe('when creating from existing data', () => {
    it('should create token with provided data', () => {
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

  describe('when managing domain events', () => {
    it('should add and retrieve domain events', () => {
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

    it('should clear domain events', () => {
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

  describe('edge cases and validations', () => {
    it('should handle token with very long expiration', () => {
      const token = PasswordResetToken.create(mockUserId, 24 * 365); // 1 ano
      const oneYearLater = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

      expect(token.getExpiresAt().getTime()).toBeCloseTo(
        oneYearLater.getTime(),
        -3,
      );
    });

    it('should handle token with immediate expiration', () => {
      const token = PasswordResetToken.create(mockUserId, 0);

      expect(token.isExpired()).toBe(true);
    });

    it('should have consistent createdAt date', () => {
      const token = PasswordResetToken.create(mockUserId);

      expect(token.getCreatedAt().getTime()).toBeCloseTo(now.getTime(), -3);
    });
  });

  describe('equality through user ID', () => {
    it('should be equal for same user ID values', () => {
      const token1 = PasswordResetToken.create(new UserId(123));
      const token2 = PasswordResetToken.create(new UserId(123));

      expect(token1.getUserId().equals(token2.getUserId())).toBe(true);
    });

    it('should be different for different user ID values', () => {
      const token1 = PasswordResetToken.create(new UserId(123));
      const token2 = PasswordResetToken.create(new UserId(456));

      expect(token1.getUserId().equals(token2.getUserId())).toBe(false);
    });
  });
});

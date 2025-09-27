import { UserId } from '../user-id.vo';

describe('UserId Value Object', () => {
  describe('when creating with valid values', () => {
    it('should create with positive number', () => {
      const userId = new UserId(123);

      expect(userId.getValue()).toBe(123);
    });

    it('should create with zero (temporary ID)', () => {
      const userId = new UserId(0);

      expect(userId.getValue()).toBe(0);
      expect(userId.isTemporary()).toBe(true);
    });
  });

  describe('when creating with invalid values', () => {
    it('should throw error for negative number', () => {
      expect(() => new UserId(-1)).toThrow('Invalid user ID');
    });

    it('should throw error for undefined', () => {
      expect(() => new UserId(undefined as any)).toThrow('Invalid user ID');
    });

    it('should throw error for null', () => {
      expect(() => new UserId(null as any)).toThrow('Invalid user ID');
    });

    it('should throw error for NaN', () => {
      expect(() => new UserId(NaN)).toThrow('Invalid user ID');
    });
  });

  describe('equality comparison', () => {
    it('should return true for same values', () => {
      const userId1 = new UserId(123);
      const userId2 = new UserId(123);

      expect(userId1.equals(userId2)).toBe(true);
    });

    it('should return false for different values', () => {
      const userId1 = new UserId(123);
      const userId2 = new UserId(456);

      expect(userId1.equals(userId2)).toBe(false);
    });

    it('should handle zero values correctly', () => {
      const tempId1 = new UserId(0);
      const tempId2 = new UserId(0);

      expect(tempId1.equals(tempId2)).toBe(true);
    });
  });

  describe('temporary ID check', () => {
    it('should return true for zero value', () => {
      const tempId = new UserId(0);

      expect(tempId.isTemporary()).toBe(true);
    });

    it('should return false for non-zero values', () => {
      const permanentId = new UserId(123);

      expect(permanentId.isTemporary()).toBe(false);
    });
  });

  describe('string representation', () => {
    it('should convert number to string', () => {
      const userId = new UserId(123);

      expect(userId.toString()).toBe('123');
    });

    it('should handle zero correctly', () => {
      const userId = new UserId(0);

      expect(userId.toString()).toBe('0');
    });
  });
});

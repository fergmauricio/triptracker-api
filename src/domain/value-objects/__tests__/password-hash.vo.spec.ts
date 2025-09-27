import { PasswordHash } from '../password-hash.vo';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('PasswordHash Value Object', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when creating with valid password', () => {
    it('should create hash successfully', async () => {
      // ARRANGE
      const mockHash = 'hashed_password_123';
      (bcrypt.hash as jest.Mock).mockResolvedValue(mockHash);

      // ACT
      const passwordHash = await PasswordHash.create('validPassword123');

      // ASSERT
      expect(passwordHash.getValue()).toBe(mockHash);
      expect(bcrypt.hash).toHaveBeenCalledWith('validPassword123', 10);
    });
  });

  describe('when creating with invalid password', () => {
    it('should throw error for short password', async () => {
      // ACT e ASSERT
      await expect(PasswordHash.create('short')).rejects.toThrow(
        'A senha deve ter no mínimo 6 caracteres.',
      );
    });

    it('should throw error for empty password', async () => {
      await expect(PasswordHash.create('')).rejects.toThrow(
        'A senha deve ter no mínimo 6 caracteres.',
      );
    });
  });

  describe('when creating from existing hash', () => {
    it('should create instance with provided hash', () => {
      // ARRANGE
      const existingHash = 'pre_hashed_value';

      // ACT
      const passwordHash = PasswordHash.fromHash(existingHash);

      // ASSERT
      expect(passwordHash.getValue()).toBe(existingHash);
    });
  });

  describe('when verifying password', () => {
    it('should return true for correct password', async () => {
      // ARRANGE
      const plainPassword = 'correctPassword';
      const passwordHash = PasswordHash.fromHash('some_hash');
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // ACT
      const isValid = await passwordHash.verify(plainPassword);

      // ASSERT
      expect(isValid).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(plainPassword, 'some_hash');
    });

    it('should return false for incorrect password', async () => {
      // ARRANGE
      const passwordHash = PasswordHash.fromHash('some_hash');
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // ACT
      const isValid = await passwordHash.verify('wrongPassword');

      // ASSERT
      expect(isValid).toBe(false);
    });
  });
});

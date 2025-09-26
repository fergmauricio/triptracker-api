import { FileKey } from '../file-key.vo';

describe('FileKey Object', () => {
  describe('when creating a valid filekey', () => {
    it('should create successfully with valid value', () => {
      const validKey = 'avatars/';

      const key = new FileKey(validKey);

      expect(key.getValue()).toBe(validKey);
    });
  });
  describe('when creating a invalid filekey', () => {
    it('should throw error for empty filekey', () => {
      expect(() => new FileKey('')).toThrow('File key inválida');
    });
    it('should throw error for a non-listed filekey', () => {
      expect(() => new FileKey('avatar/')).toThrow('File key inválida');
    });
    it('should reject path traversal attempts', () => {
      const invalidKey = 'avatars/../../../etc/passwd';

      expect(() => new FileKey(invalidKey)).toThrow('File key inválida');
    });
  });
  describe('when creating a file key with invalid characters', () => {
    it('should reject keys with special characters', () => {
      const invalidKey = 'avatars/user@123#photo?.jpg';

      expect(() => new FileKey(invalidKey)).toThrow('File key inválida');
    });

    it('should reject keys with spaces', () => {
      const invalidKey = 'avatars/user 123 photo.jpg';

      expect(() => new FileKey(invalidKey)).toThrow('File key inválida');
    });

    it('should accept keys with safe characters', () => {
      const validKey = 'avatars/user-123_photo.v2.jpg';

      expect(() => new FileKey(validKey)).not.toThrow();
    });
  });
});

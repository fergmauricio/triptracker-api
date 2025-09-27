import { FileSize } from '../file-size.vo';

describe('FileSize Value Object', () => {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB

  describe('when creating a valid file size', () => {
    it('should accept size within limit', () => {
      const validSize = MAX_SIZE;

      const fileSize = new FileSize(validSize);

      expect(fileSize.getValue()).toBe(validSize);
    });

    it('should accept size below limit', () => {
      const smallSize = 1024; // 1KB

      expect(() => new FileSize(smallSize)).not.toThrow();
    });

    it('should accept zero size (empty file)', () => {
      expect(() => new FileSize(0)).toThrow('Arquivo muito grande');
    });

    it('should accept minimum positive size', () => {
      const minSize = 1; // 1 byte

      const fileSize = new FileSize(minSize);

      expect(fileSize.getValue()).toBe(minSize);
    });
  });

  describe('when creating an invalid file size', () => {
    it('should reject size above limit', () => {
      const oversized = MAX_SIZE + 1; // 5MB + 1 byte

      expect(() => new FileSize(oversized)).toThrow('Arquivo muito grande');
    });

    it('should reject negative size', () => {
      const negativeSize = -100;

      expect(() => new FileSize(negativeSize)).toThrow('Arquivo muito grande');
    });

    it('should include formatted size in error message', () => {
      const oversized = 10 * 1024 * 1024; // 10MB

      expect(() => new FileSize(oversized)).toThrow('10.00MB');
    });
  });

  describe('formatSize method (tested indirectly)', () => {
    it('should format bytes to megabytes correctly', () => {
      const oversized = 5.5 * 1024 * 1024; // 5.5MB

      expect(() => new FileSize(oversized)).toThrow('5.50MB');
    });

    it('should format large sizes correctly', () => {
      const largeOversized = 100.75 * 1024 * 1024; // 100.75MB

      expect(() => new FileSize(largeOversized)).toThrow('100.75MB');
    });

    it('should format fractional sizes with rounding', () => {
      const fractionalSize = 7.357 * 1024 * 1024;

      expect(() => new FileSize(fractionalSize)).toThrow('7.36MB');
    });
  });
});

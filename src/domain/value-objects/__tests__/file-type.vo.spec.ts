import { FileType } from '../file-type.vo';

describe('FileType Value Object', () => {
  describe('when creating with valid MIME types', () => {
    it('should accept image/jpeg', () => {
      const fileType = new FileType('image/jpeg');

      expect(fileType.getValue()).toBe('image/jpeg');
    });

    it('should accept image/png', () => {
      expect(() => new FileType('image/png')).not.toThrow();
    });

    it('should accept image/gif', () => {
      expect(() => new FileType('image/gif')).not.toThrow();
    });
  });

  // edge cases
  describe('when creating with invalid MIME types', () => {
    it('should reject non-image types', () => {
      expect(() => new FileType('application/pdf')).toThrow(
        'Tipo de arquivo não suportado: application/pdf',
      );
    });

    it('should reject unsupported image types', () => {
      expect(() => new FileType('image/webp')).toThrow(
        'Tipo de arquivo não suportado: image/webp',
      );
    });

    it('should reject empty string', () => {
      expect(() => new FileType('')).toThrow('Tipo de arquivo não suportado: ');
    });
  });

  // MÉTODOS UTILITÁRIOS
  describe('utility methods', () => {
    describe('isImage() method', () => {
      it('should return true for image types', () => {
        const jpegType = new FileType('image/jpeg');
        const pngType = new FileType('image/png');

        expect(jpegType.isImage()).toBe(true);
        expect(pngType.isImage()).toBe(true);
      });
    });

    describe('getExtension() method', () => {
      it('should return extension for JPEG', () => {
        const jpegType = new FileType('image/jpeg');

        expect(jpegType.getExtension()).toBe('jpeg');
      });

      it('should return extension for PNG', () => {
        const pngType = new FileType('image/png');

        expect(pngType.getExtension()).toBe('png');
      });

      it('should return extension for GIF', () => {
        const gifType = new FileType('image/gif');

        expect(gifType.getExtension()).toBe('gif');
      });
    });
  });
});

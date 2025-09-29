import { FileType } from '../file-type.vo';

describe('Objeto de Valor FileType', () => {
  describe('ao criar com tipos MIME válidos', () => {
    it('deve aceitar image/jpeg', () => {
      const fileType = new FileType('image/jpeg');

      expect(fileType.getValue()).toBe('image/jpeg');
    });

    it('deve aceitar image/png', () => {
      expect(() => new FileType('image/png')).not.toThrow();
    });

    it('deve aceitar image/gif', () => {
      expect(() => new FileType('image/gif')).not.toThrow();
    });
  });

  describe('ao criar com tipos MIME inválidos', () => {
    it('deve rejeitar tipos que não são imagem', () => {
      expect(() => new FileType('application/pdf')).toThrow(
        'Tipo de arquivo não suportado: application/pdf',
      );
    });

    it('deve rejeitar tipos de imagem não suportados', () => {
      expect(() => new FileType('image/webp')).toThrow(
        'Tipo de arquivo não suportado: image/webp',
      );
    });

    it('deve rejeitar string vazia', () => {
      expect(() => new FileType('')).toThrow('Tipo de arquivo não suportado: ');
    });
  });

  describe('métodos utilitários', () => {
    describe('método isImage()', () => {
      it('deve retornar true para tipos de imagem', () => {
        const jpegType = new FileType('image/jpeg');
        const pngType = new FileType('image/png');

        expect(jpegType.isImage()).toBe(true);
        expect(pngType.isImage()).toBe(true);
      });
    });

    describe('método getExtension()', () => {
      it('deve retornar a extensão para JPEG', () => {
        const jpegType = new FileType('image/jpeg');

        expect(jpegType.getExtension()).toBe('jpeg');
      });

      it('deve retornar a extensão para PNG', () => {
        const pngType = new FileType('image/png');

        expect(pngType.getExtension()).toBe('png');
      });

      it('deve retornar a extensão para GIF', () => {
        const gifType = new FileType('image/gif');

        expect(gifType.getExtension()).toBe('gif');
      });
    });
  });
});

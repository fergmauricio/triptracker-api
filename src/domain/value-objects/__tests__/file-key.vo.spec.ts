import { FileKey } from '../file-key.vo';

describe('Objeto FileKey', () => {
  describe('ao criar uma filekey válida', () => {
    it('deve criar com sucesso com um valor válido', () => {
      const validKey = 'avatars/';

      const key = new FileKey(validKey);

      expect(key.getValue()).toBe(validKey);
    });
  });

  describe('ao criar uma filekey inválida', () => {
    it('deve lançar erro para filekey vazia', () => {
      expect(() => new FileKey('')).toThrow('File key inválida');
    });

    it('deve lançar erro para uma filekey não listada', () => {
      expect(() => new FileKey('avatar/')).toThrow('File key inválida');
    });

    it('deve rejeitar tentativas de path traversal', () => {
      const invalidKey = 'avatars/../../../etc/passwd';

      expect(() => new FileKey(invalidKey)).toThrow('File key inválida');
    });
  });

  describe('ao criar uma filekey com caracteres inválidos', () => {
    it('deve rejeitar keys com caracteres especiais', () => {
      const invalidKey = 'avatars/user@123#photo?.jpg';

      expect(() => new FileKey(invalidKey)).toThrow('File key inválida');
    });

    it('deve rejeitar keys com espaços', () => {
      const invalidKey = 'avatars/user 123 photo.jpg';

      expect(() => new FileKey(invalidKey)).toThrow('File key inválida');
    });

    it('deve aceitar keys com caracteres seguros', () => {
      const validKey = 'avatars/user-123_photo.v2.jpg';

      expect(() => new FileKey(validKey)).not.toThrow();
    });
  });
});

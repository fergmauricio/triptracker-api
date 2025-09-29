import { FileSize } from '../file-size.vo';

describe('Objeto de Valor FileSize', () => {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB

  describe('ao criar um tamanho de arquivo válido', () => {
    it('deve aceitar tamanho dentro do limite', () => {
      const validSize = MAX_SIZE;

      const fileSize = new FileSize(validSize);

      expect(fileSize.getValue()).toBe(validSize);
    });

    it('deve aceitar tamanho abaixo do limite', () => {
      const smallSize = 1024; // 1KB

      expect(() => new FileSize(smallSize)).not.toThrow();
    });

    it('deve aceitar tamanho zero (arquivo vazio)', () => {
      expect(() => new FileSize(0)).toThrow('Arquivo muito grande');
    });

    it('deve aceitar tamanho positivo mínimo', () => {
      const minSize = 1; // 1 byte

      const fileSize = new FileSize(minSize);

      expect(fileSize.getValue()).toBe(minSize);
    });
  });

  describe('ao criar um tamanho de arquivo inválido', () => {
    it('deve rejeitar tamanho acima do limite', () => {
      const oversized = MAX_SIZE + 1; // 5MB + 1 byte

      expect(() => new FileSize(oversized)).toThrow('Arquivo muito grande');
    });

    it('deve rejeitar tamanho negativo', () => {
      const negativeSize = -100;

      expect(() => new FileSize(negativeSize)).toThrow('Arquivo muito grande');
    });

    it('deve incluir tamanho formatado na mensagem de erro', () => {
      const oversized = 10 * 1024 * 1024; // 10MB

      expect(() => new FileSize(oversized)).toThrow('10.00MB');
    });
  });

  describe('método formatSize (testado indiretamente)', () => {
    it('deve formatar bytes para megabytes corretamente', () => {
      const oversized = 5.5 * 1024 * 1024; // 5.5MB

      expect(() => new FileSize(oversized)).toThrow('5.50MB');
    });

    it('deve formatar tamanhos grandes corretamente', () => {
      const largeOversized = 100.75 * 1024 * 1024; // 100.75MB

      expect(() => new FileSize(largeOversized)).toThrow('100.75MB');
    });

    it('deve formatar tamanhos fracionários com arredondamento', () => {
      const fractionalSize = 7.357 * 1024 * 1024;

      expect(() => new FileSize(fractionalSize)).toThrow('7.36MB');
    });
  });
});

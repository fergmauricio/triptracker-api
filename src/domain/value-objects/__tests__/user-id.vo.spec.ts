import { UserId } from '../user-id.vo';

describe('Objeto de Valor UserId', () => {
  describe('ao criar com valores válidos', () => {
    it('deve criar com número positivo', () => {
      const userId = new UserId(123);

      expect(userId.getValue()).toBe(123);
    });

    it('deve criar com zero (ID temporário)', () => {
      const userId = new UserId(0);

      expect(userId.getValue()).toBe(0);
      expect(userId.isTemporary()).toBe(true);
    });
  });

  describe('ao criar com valores inválidos', () => {
    it('deve lançar erro para número negativo', () => {
      expect(() => new UserId(-1)).toThrow('Invalid user ID');
    });

    it('deve lançar erro para undefined', () => {
      expect(() => new UserId(undefined as any)).toThrow('Invalid user ID');
    });

    it('deve lançar erro para null', () => {
      expect(() => new UserId(null as any)).toThrow('Invalid user ID');
    });

    it('deve lançar erro para NaN', () => {
      expect(() => new UserId(NaN)).toThrow('Invalid user ID');
    });
  });

  describe('comparação de igualdade', () => {
    it('deve retornar true para mesmos valores', () => {
      const userId1 = new UserId(123);
      const userId2 = new UserId(123);

      expect(userId1.equals(userId2)).toBe(true);
    });

    it('deve retornar false para valores diferentes', () => {
      const userId1 = new UserId(123);
      const userId2 = new UserId(456);

      expect(userId1.equals(userId2)).toBe(false);
    });

    it('deve lidar com valores zero corretamente', () => {
      const tempId1 = new UserId(0);
      const tempId2 = new UserId(0);

      expect(tempId1.equals(tempId2)).toBe(true);
    });
  });

  describe('verificação de ID temporário', () => {
    it('deve retornar true para valor zero', () => {
      const tempId = new UserId(0);

      expect(tempId.isTemporary()).toBe(true);
    });

    it('deve retornar false para valores não-zero', () => {
      const permanentId = new UserId(123);

      expect(permanentId.isTemporary()).toBe(false);
    });
  });

  describe('representação em string', () => {
    it('deve converter número para string', () => {
      const userId = new UserId(123);

      expect(userId.toString()).toBe('123');
    });

    it('deve lidar com zero corretamente', () => {
      const userId = new UserId(0);

      expect(userId.toString()).toBe('0');
    });
  });
});

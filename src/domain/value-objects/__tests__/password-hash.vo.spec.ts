import { PasswordHash } from '../password-hash.vo';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('Objeto de Valor PasswordHash', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ao criar com senha válida', () => {
    it('deve criar hash com sucesso', async () => {
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

  describe('ao criar com senha inválida', () => {
    it('deve lançar erro para senha curta', async () => {
      // ACT e ASSERT
      await expect(PasswordHash.create('short')).rejects.toThrow(
        'A senha deve ter no mínimo 6 caracteres.',
      );
    });

    it('deve lançar erro para senha vazia', async () => {
      await expect(PasswordHash.create('')).rejects.toThrow(
        'A senha deve ter no mínimo 6 caracteres.',
      );
    });
  });

  describe('ao criar a partir de hash existente', () => {
    it('deve criar instância com o hash fornecido', () => {
      // ARRANGE
      const existingHash = 'pre_hashed_value';

      // ACT
      const passwordHash = PasswordHash.fromHash(existingHash);

      // ASSERT
      expect(passwordHash.getValue()).toBe(existingHash);
    });
  });

  describe('ao verificar senha', () => {
    it('deve retornar true para senha correta', async () => {
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

    it('deve retornar false para senha incorreta', async () => {
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

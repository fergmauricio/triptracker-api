import { Email } from '../email.vo';

describe('Objeto de Valor Email', () => {
  describe('ao criar um e-mail válido', () => {
    it('deve criar com sucesso com um e-mail válido', () => {
      const validEmail = 'user@triptracking.com.br';

      const email = new Email(validEmail);

      expect(email.getValue()).toBe(validEmail);
    });
  });

  describe('ao criar um e-mail inválido', () => {
    it('deve lançar erro para e-mail vazio', () => {
      const emptyEmail = '';

      expect(() => new Email(emptyEmail)).toThrow('E-mail inválido.');
    });

    it('deve lançar erro para e-mail sem @', () => {
      expect(() => new Email('invalid-email')).toThrow('E-mail inválido.');
    });

    it('deve lançar erro para e-mail sem domínio', () => {
      expect(() => new Email('user@')).toThrow('E-mail inválido.');
    });
  });

  describe('comparação de igualdade', () => {
    it('deve considerar dois e-mails iguais se os valores forem os mesmos', () => {
      const email1 = new Email('user@triptracking.com.br');
      const email2 = new Email('user@triptracking.com.br');

      expect(email1.getValue()).toEqual(email2.getValue());
    });

    it('deve considerar dois e-mails diferentes se os valores forem diferentes', () => {
      const email1 = new Email('test1@triptracking.com.br');
      const email2 = new Email('test2@triptracking.com.br');

      expect(email1.getValue()).not.toEqual(email2.getValue());
    });
  });
});

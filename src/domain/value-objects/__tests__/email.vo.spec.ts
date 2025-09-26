import { Email } from '../email.vo';

describe('Email Value Object', () => {
  describe('when creating a valid email', () => {
    it('should create successfully with valid email', () => {
      const validEmail = 'user@triptracking.com.br';

      const email = new Email(validEmail);

      expect(email.getValue()).toBe(validEmail);
    });
  });

  describe('when creating an invalid email', () => {
    it('should throw error for empty email', () => {
      const emptyEmail = '';

      expect(() => new Email(emptyEmail)).toThrow('E-mail inválido.');
    });

    it('should throw error for email without @', () => {
      expect(() => new Email('invalid-email')).toThrow('E-mail inválido.');
    });

    it('should throw error for email without domain', () => {
      expect(() => new Email('user@')).toThrow('E-mail inválido.');
    });
  });

  describe('equality comparison', () => {
    it('should consider two emails equal if values are same', () => {
      const email1 = new Email('user@triptracking.com.br');
      const email2 = new Email('user@triptracking.com.br');

      expect(email1.getValue()).toEqual(email2.getValue());
    });

    it('should consider two emails different if values differ', () => {
      const email1 = new Email('test1@triptracking.com.br');
      const email2 = new Email('test2@triptracking.com.br');

      expect(email1.getValue()).not.toEqual(email2.getValue());
    });
  });
});

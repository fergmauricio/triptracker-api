import * as bcrypt from 'bcryptjs';

export class PasswordHash {
  private readonly value: string;

  private constructor(hash: string) {
    this.value = hash;
  }

  static async create(plainPassword: string): Promise<PasswordHash> {
    if (plainPassword.length < 6) {
      throw new Error('A senha deve ter no mínimo 6 caracteres.');
    }

    const hash = await bcrypt.hash(plainPassword, 10);
    return new PasswordHash(hash);
  }

  static fromHash(hash: string): PasswordHash {
    return new PasswordHash(hash);
  }

  async verify(plainPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, this.value);
  }

  getValue(): string {
    return this.value;
  }
}

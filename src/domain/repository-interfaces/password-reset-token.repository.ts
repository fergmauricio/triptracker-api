import { PasswordResetToken } from '../entities/password-reset-token.entity';

export interface PasswordResetTokenRepository {
  findByToken(token: string): Promise<PasswordResetToken | null>;
  save(token: PasswordResetToken): Promise<void>;
  deleteByUserId(userId: number): Promise<void>;
  delete(token: PasswordResetToken): Promise<void>;
}

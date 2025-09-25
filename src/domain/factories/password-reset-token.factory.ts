import { PasswordResetToken } from '../entities/password-reset-token.entity';
import { UserId } from '../value-objects/user-id.vo';
import * as crypto from 'crypto';

export class PasswordResetTokenFactory {
  static create(userId: UserId): PasswordResetToken {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    return new PasswordResetToken(0, token, userId, expiresAt);
  }
}

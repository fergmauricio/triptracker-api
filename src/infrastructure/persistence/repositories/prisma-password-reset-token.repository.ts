import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PasswordResetTokenRepository } from '../../../domain/repository-interfaces/password-reset-token.repository';
import { PasswordResetToken } from '../../../domain/entities/password-reset-token.entity';
import { UserId } from '../../../domain/value-objects/user-id.vo';

@Injectable()
export class PrismaPasswordResetTokenRepository
  implements PasswordResetTokenRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async findByToken(token: string): Promise<PasswordResetToken | null> {
    const tokenData = await this.prisma.password_reset_tokens.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!tokenData) return null;

    return new PasswordResetToken(
      tokenData.id,
      tokenData.token,
      new UserId(tokenData.user_id),
      tokenData.expires_at,
      tokenData.created_at,
    );
  }

  async save(token: PasswordResetToken): Promise<void> {
    const tokenData = {
      token: token.getToken(),
      user_id: token.getUserId().getValue(),
      expires_at: token.getExpiresAt(),
      created_at: token.getCreatedAt(),
    };

    if (token.getId() === 0) {
      await this.prisma.password_reset_tokens.create({ data: tokenData });
    } else {
      await this.prisma.password_reset_tokens.update({
        where: { id: token.getId() },
        data: tokenData,
      });
    }
  }

  async deleteByUserId(userId: number): Promise<void> {
    await this.prisma.password_reset_tokens.deleteMany({
      where: { user_id: userId },
    });
  }

  async delete(token: PasswordResetToken): Promise<void> {
    await this.prisma.password_reset_tokens.delete({
      where: { id: token.getId() },
    });
  }
}

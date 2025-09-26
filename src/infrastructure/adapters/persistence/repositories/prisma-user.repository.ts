import { Injectable } from '@nestjs/common';

import { UserRepository } from '../../../../domain/repository-interfaces/user.repository';
import { User } from '../../../../domain/entities/user.entity';
import { UserId } from '../../../../domain/value-objects/user-id.vo';
import { Email } from '../../../../domain/value-objects/email.vo';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: UserId): Promise<User | null> {
    const userData = await this.prisma.user.findUnique({
      where: { id_user: id.getValue() },
    });

    if (!userData) return null;

    return User.fromPersistence(
      userData.id_user,
      userData.name,
      userData.email,
      userData.password,
      userData.active,
      userData.thumb,
    );
  }

  async findByEmail(email: Email): Promise<User | null> {
    const userData = await this.prisma.user.findUnique({
      where: { email: email.getValue() },
    });

    if (!userData) return null;

    return User.fromPersistence(
      userData.id_user,
      userData.name,
      userData.email,
      userData.password,
      userData.active,
      userData.thumb,
    );
  }

  async existsWithEmail(email: Email): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { email: email.getValue() },
    });
    return count > 0;
  }

  async save(user: User): Promise<void> {
    const userData = {
      name: user.getName(),
      email: user.getEmail().getValue(),
      password: user.getPasswordHash(),
      active: user.isActive(),
      thumb: user.getAvatarUrl(),
    };

    if (user.getId().isTemporary()) {
      const newUser = await this.prisma.user.create({ data: userData });

      (user as any).id = new UserId(newUser.id_user);
    } else {
      await this.prisma.user.update({
        where: { id_user: user.getId().getValue() },
        data: userData,
      });
    }
  }
}

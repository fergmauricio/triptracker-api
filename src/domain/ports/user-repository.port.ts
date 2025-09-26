import { User } from '@domain/entities/user.entity';
import { Email } from '@domain/value-objects/email.vo';
import { UserId } from '@domain/value-objects/user-id.vo';

export interface IUserRepository {
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  save(user: User): Promise<void>;
  existsWithEmail(email: Email): Promise<boolean>;
}

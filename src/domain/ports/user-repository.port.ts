import { User } from '@domain/entities/user.entity';
import { Email } from '@domain/value-objects/email.vo';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  save(user: User): Promise<void>;
  existsWithEmail(email: Email): Promise<boolean>;
}

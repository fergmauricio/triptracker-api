import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.vo';
import { SignUpCommand } from '../dtos/signup-command';
import { JwtAuthService } from '../../infrastructure/auth/jwt.service';
import { DomainEventPublisher } from '../ports/domain-event-publisher.port';

export interface IUserRepository {
  findByEmail(email: Email): Promise<User | null>;
  save(user: User): Promise<void>;
}

export class SignUpUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly jwtAuthService: JwtAuthService,
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async execute(
    command: SignUpCommand,
  ): Promise<{ userId: number; accessToken: string }> {
    const email = new Email(command.email);

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }

    const user = await User.create(command.name, email, command.password);
    console.log(
      '[DEBUG] Usuário criado, domain events:',
      user.getDomainEvents().length,
    );

    await this.userRepository.save(user);
    console.log('[DEBUG] Usuário salvo no banco!');

    // Publicar eventos
    const events = user.getDomainEvents();
    console.log('[DEBUG] Evento sendo publicados:', events.length);

    if (events.length > 0 && this.eventPublisher) {
      console.log('[DEBUG] Publicando eventos...');
      for (const event of events) {
        console.log('[DEBUG] evento: ', event);
        await this.eventPublisher.publish(event);
      }
      user.clearDomainEvents();
    } else {
      console.log('[DEBUG] Nenhum evento publicado no eventPublisher');
    }

    const accessToken = await this.jwtAuthService.generateAccessToken(user);

    return {
      userId: user.getId().getValue(),
      accessToken,
    };
  }
}

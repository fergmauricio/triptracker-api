import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class JwtAuthService {
  constructor(private readonly nestJwtService: NestJwtService) {}

  async generateAccessToken(user: User): Promise<string> {
    const payload = {
      sub: user.getId().getValue(),
      email: user.getEmail().getValue(),
      name: user.getName(),
    };

    return this.nestJwtService.signAsync(payload, { expiresIn: '7d' });
  }

  async verifyToken(token: string): Promise<any> {
    return this.nestJwtService.verifyAsync(token);
  }
}

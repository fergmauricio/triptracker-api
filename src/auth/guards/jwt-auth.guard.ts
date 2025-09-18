import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
// A string 'jwt' deve corresponder ao nome da Strategy,
// que é definido automaticamente por PassportStrategy(Strategy) na JwtStrategy.

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const jwtSecret = configService.get('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error(
        'JWT_SECRET não está definida nas variáveis de ambiente. Por favor, defina-a no arquivo .env',
      );
    }

    super({
      // Define de onde o token será extraído (no cabeçalho Authorization como Bearer Token)
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Chave secreta para verificar a assinatura do token. Deve ser a mesma usada no JwtModule.
      secretOrKey: jwtSecret,
      ignoreExpiration: false, // Importante: não ignora a expiração do token
    });
  }

  // Este método é chamado automaticamente se o token for válido
  // Seu payload (decodificado) é passado como parâmetro
  async validate(payload: any) {
    // Aqui você pode, por exemplo, buscar o usuário completo no banco usando o 'sub' (subject) do payload
    // return await this.prisma.user.findUnique({ where: { id: payload.sub } });

    // Por enquanto, vamos apenas retornar o payload básico (userId e email)
    // Isso será injetado no `request.user` da rota protegida
    return { userId: payload.sub, email: payload.email };
  }
}

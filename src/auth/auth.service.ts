// src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { QueueService } from '../queue/queue.service';

import { PrismaService } from '../prisma/prisma.service';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private queueService: QueueService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<{ access_token: string }> {
    const { email, password, name } = signUpDto;

    // 1. Criptografa a senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. Cria o usuário no banco
    const user = await this.prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword, // Salva a senha criptografada
      },
    });

    // 3. Gera o token JWT para o usuário recém-criado

    const payload = { sub: user.id_user, email: user.email };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async signIn(signInDto: SignInDto): Promise<{ access_token: string }> {
    const { email, password } = signInDto;

    // 1. Encontra o usuário pelo email
    const user = await this.prisma.user.findUnique({ where: { email } });

    // 2. Se o usuário não existir OU a senha não bater, retorna erro
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    // 3. Gera o token JWT
    const payload = { sub: user.id_user, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    // 1. Verifique se o usuário existe
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Por segurança, não revele se o email existe ou não
      return { message: 'Se o email existir, um link de reset será enviado' };
    }

    // 2. Gere um token único
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // Expira em 1 hora

    // 3. Salve o token no banco (delete tokens anteriores para o mesmo usuário)
    await this.prisma.password_reset_tokens.deleteMany({
      where: { user_id: user.id_user },
    });

    await this.prisma.password_reset_tokens.create({
      data: {
        token,
        user_id: user.id_user,
        expires_at: expiresAt,
      },
    });

    // 4. Adicione o job na fila para enviar email
    await this.queueService.addEmailJob({
      email: user.email,
      token,
      userId: user.id_user,
      userName: user.name,
    });

    return { message: 'Se o email existir, um link de reset será enviado' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, password } = resetPasswordDto;

    // 1. Encontre o token válido
    const resetToken = await this.prisma.password_reset_tokens.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken || resetToken.expires_at < new Date()) {
      throw new NotFoundException('Token inválido ou expirado');
    }

    // 2. Criptografe a nova senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Atualize a senha do usuário
    await this.prisma.user.update({
      where: { id_user: resetToken.user_id },
      data: { password: hashedPassword },
    });

    // 4. Delete o token usado
    await this.prisma.password_reset_tokens.delete({
      where: { id: resetToken.id },
    });

    return { message: 'Senha redefinida com sucesso' };
  }
}

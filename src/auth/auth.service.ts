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

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    const payload = { sub: user.id_user, email: user.email };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async signIn(signInDto: SignInDto): Promise<{ access_token: string }> {
    const { email, password } = signInDto;

    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    const payload = { sub: user.id_user, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    console.log('Solicitação de reset para:', email);

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log('Usuário não encontrado:', email);
      return { message: 'Se o email existir, um link de reset será enviado' };
    }

    console.log('Usuário encontrado, criando token...');

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // Expira em 1 hora

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

    const resetToken = await this.prisma.password_reset_tokens.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken || resetToken.expires_at < new Date()) {
      throw new NotFoundException('Token inválido ou expirado');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.prisma.user.update({
      where: { id_user: resetToken.user_id },
      data: { password: hashedPassword },
    });

    await this.prisma.password_reset_tokens.delete({
      where: { id: resetToken.id },
    });

    return { message: 'Senha redefinida com sucesso' };
  }
}

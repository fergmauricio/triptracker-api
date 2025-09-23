/**
 * AuthService - Serviço completo de autenticação
 *
 * Responsabilidades:
 * - Registro de novos usuários
 * - Autenticação e login
 * - Gerenciamento de reset de senha
 * - Operações com tokens JWT
 *
 * Nota: Por simplicidade e coesão, todas as operações de auth
 * estão mantidas em um único serviço. Para projetos em escala
 * enterprise, considerar separação em serviços especializados.
 */

import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
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
    try {
      const { email, password, name } = signUpDto;

      if (!email || !password || !name) {
        throw new BadRequestException({
          message: 'Dados incompletos',
          details: 'Email, senha e nome são obrigatórios',
          code: 'MISSING_REQUIRED_FIELDS',
        });
      }

      if (password.length < 6) {
        throw new BadRequestException({
          message: 'Senha muito curta',
          details: 'A senha deve ter pelo menos 6 caracteres',
          code: 'PASSWORD_TOO_SHORT',
        });
      }

      if (!this.isValidEmail(email)) {
        throw new BadRequestException({
          message: 'Email inválido',
          details: 'Forneça um endereço de email válido',
          code: 'INVALID_EMAIL_FORMAT',
        });
      }

      const existingUser = await this.prisma.user.findUnique({
        where: { email },
        select: { id_user: true },
      });

      if (existingUser) {
        throw new ConflictException({
          message: 'Email já cadastrado',
          details: 'Já existe uma conta com este email',
          code: 'EMAIL_ALREADY_EXISTS',
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await this.prisma.user.create({
        data: {
          email: email.toLowerCase().trim(),
          name: name.trim(),
          password: hashedPassword,
        },
      });

      const payload = {
        sub: user.id_user,
        email: user.email,
        name: user.name,
      };

      const access_token = await this.jwtService.signAsync(payload);

      return { access_token };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      console.error('SignUp Error:', error);
      throw new InternalServerErrorException({
        message: 'Erro interno no cadastro',
        details: 'Tente novamente mais tarde',
        code: 'SIGNUP_ERROR',
      });
    }
  }

  async signIn(signInDto: SignInDto): Promise<{ access_token: string }> {
    try {
      const { email, password } = signInDto;

      if (!email || !password) {
        throw new BadRequestException({
          message: 'Dados incompletos',
          details: 'Email e senha são obrigatórios',
          code: 'MISSING_CREDENTIALS',
        });
      }

      const user = await this.prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });

      if (!user) {
        throw new UnauthorizedException({
          message: 'Credenciais inválidas',
          details: 'Email ou senha incorretos',
          code: 'INVALID_CREDENTIALS',
        });
      }

      if (!user.active) {
        throw new UnauthorizedException({
          message: 'Conta desativada',
          details: 'Entre em contato com o suporte',
          code: 'ACCOUNT_DISABLED',
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new UnauthorizedException({
          message: 'Credenciais inválidas',
          details: 'Email ou senha incorretos',
          code: 'INVALID_CREDENTIALS',
        });
      }

      const payload = {
        sub: user.id_user,
        email: user.email,
        name: user.name,
      };

      const access_token = await this.jwtService.signAsync(payload);

      return { access_token };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }

      console.error('SignIn Error:', error);
      throw new InternalServerErrorException({
        message: 'Erro interno no login',
        details: 'Tente novamente mais tarde',
        code: 'SIGNIN_ERROR',
      });
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    try {
      const { email } = forgotPasswordDto;

      if (!email) {
        throw new BadRequestException({
          message: 'Email obrigatório',
          details: 'Forneça um endereço de email',
          code: 'MISSING_EMAIL',
        });
      }

      if (!this.isValidEmail(email)) {
        throw new BadRequestException({
          message: 'Email inválido',
          details: 'Forneça um endereço de email válido',
          code: 'INVALID_EMAIL_FORMAT',
        });
      }

      const user = await this.prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });

      if (!user) {
        console.log('Email não encontrado (por segurança):', email);
        return {
          message:
            'Se o email existir em nosso sistema, um link de redefinição será enviado',
        };
      }

      if (!user.active) {
        return {
          message:
            'Se o email existir em nosso sistema, um link de redefinição será enviado',
        };
      }

      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

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

      try {
        await this.queueService.addEmailJob({
          email: user.email,
          token,
          userId: user.id_user,
          userName: user.name,
        });
      } catch (emailError) {
        console.error('Erro ao enfileirar email:', emailError);
      }

      return {
        message:
          'Se o email existir em nosso sistema, um link de redefinição será enviado',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      console.error('ForgotPassword Error:', error);
      throw new InternalServerErrorException({
        message: 'Erro interno na solicitação de reset',
        details: 'Tente novamente mais tarde',
        code: 'FORGOT_PASSWORD_ERROR',
      });
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      const { token, password } = resetPasswordDto;

      if (!token || !password) {
        throw new BadRequestException({
          message: 'Dados incompletos',
          details: 'Token e nova senha são obrigatórios',
          code: 'MISSING_REQUIRED_FIELDS',
        });
      }

      if (password.length < 6) {
        throw new BadRequestException({
          message: 'Senha muito curta',
          details: 'A senha deve ter pelo menos 6 caracteres',
          code: 'PASSWORD_TOO_SHORT',
        });
      }

      const resetToken = await this.prisma.password_reset_tokens.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!resetToken) {
        throw new NotFoundException({
          message: 'Token inválido',
          details: 'Solicite um novo link de redefinição',
          code: 'INVALID_TOKEN',
        });
      }

      if (resetToken.expires_at < new Date()) {
        await this.prisma.password_reset_tokens.delete({
          where: { id: resetToken.id },
        });

        throw new NotFoundException({
          message: 'Token expirado',
          details: 'Solicite um novo link de redefinição',
          code: 'EXPIRED_TOKEN',
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await this.prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id_user: resetToken.user_id },
          data: { password: hashedPassword },
        });

        await tx.password_reset_tokens.delete({
          where: { id: resetToken.id },
        });
      });

      return {
        message: 'Senha redefinida com sucesso',
        details: 'Você já pode fazer login com sua nova senha',
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      console.error('ResetPassword Error:', error);
      throw new InternalServerErrorException({
        message: 'Erro interno na redefinição de senha',
        details: 'Tente novamente mais tarde',
        code: 'RESET_PASSWORD_ERROR',
      });
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

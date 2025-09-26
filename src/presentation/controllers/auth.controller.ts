import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import {
  SignUpRequestDto,
  SignInRequestDto,
  AuthResponseDto,
  ForgotPasswordRequestDto,
  ResetPasswordRequestDto,
} from '../dtos';
import {
  SignUpUseCase,
  SignInUseCase,
  ForgotPasswordUseCase,
  ResetPasswordUseCase,
} from '../../application/use-cases';
import { JwtAuthGuard } from '@infrastructure/adapters/auth/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly signUpUseCase: SignUpUseCase,
    private readonly signInUseCase: SignInUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
  ) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signUp(
    @Body() signUpRequestDto: SignUpRequestDto,
  ): Promise<AuthResponseDto> {
    try {
      const result = await this.signUpUseCase.execute({
        name: signUpRequestDto.name,
        email: signUpRequestDto.email,
        password: signUpRequestDto.password,
      });

      return new AuthResponseDto(
        result.accessToken,
        result.userId,
        signUpRequestDto.email,
        signUpRequestDto.name,
      );
    } catch (error) {
      this.handleUseCaseError(error);
    }
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Body() signInRequestDto: SignInRequestDto,
  ): Promise<AuthResponseDto> {
    try {
      const result = await this.signInUseCase.execute(
        signInRequestDto.email,
        signInRequestDto.password,
      );

      return new AuthResponseDto(
        result.accessToken,
        result.userId,
        signInRequestDto.email,
        'User Name',
      );
    } catch (error) {
      this.handleUseCaseError(error);
    }
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body() forgotPasswordRequestDto: ForgotPasswordRequestDto,
  ): Promise<{ message: string }> {
    try {
      return await this.forgotPasswordUseCase.execute(
        forgotPasswordRequestDto.email,
      );
    } catch (error) {
      this.handleUseCaseError(error);
    }
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() resetPasswordRequestDto: ResetPasswordRequestDto,
  ): Promise<{ message: string }> {
    try {
      return await this.resetPasswordUseCase.execute(
        resetPasswordRequestDto.token,
        resetPasswordRequestDto.password,
      );
    } catch (error) {
      this.handleUseCaseError(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
    };
  }

  private handleUseCaseError(error: any): never {
    switch (error.message) {
      case 'EMAIL_ALREADY_EXISTS':
        throw new ConflictException({
          message: 'Email já cadastrado',
          details: 'Já existe uma conta com este email',
          code: 'EMAIL_ALREADY_EXISTS',
        });

      case 'INVALID_CREDENTIALS':
        throw new UnauthorizedException({
          message: 'Credenciais inválidas',
          details: 'Email ou senha incorretos',
          code: 'INVALID_CREDENTIALS',
        });

      case 'ACCOUNT_DISABLED':
        throw new UnauthorizedException({
          message: 'Conta desativada',
          details: 'Entre em contato com o suporte',
          code: 'ACCOUNT_DISABLED',
        });

      case 'INVALID_TOKEN':
      case 'EXPIRED_TOKEN':
        throw new NotFoundException({
          message: 'Token inválido ou expirado',
          details: 'Solicite um novo link de redefinição',
          code: error.message,
        });

      case 'USER_NOT_FOUND':
        throw new NotFoundException({
          message: 'Usuário não encontrado',
          details: 'O usuário associado ao token não existe',
          code: 'USER_NOT_FOUND',
        });

      default:
        throw new BadRequestException({
          message: 'Erro na solicitação',
          details: error.message || 'Erro interno',
          code: 'VALIDATION_ERROR',
        });
    }
  }
}

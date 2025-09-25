import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
  Get,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadAvatarUseCase } from '../../application/use-cases/upload-avatar.use-case';
import { GenerateSignedUrlUseCase } from '../../application/use-cases/generate-signed-url.use-case';
import { UploadAvatarRequestDto } from '../dtos/upload-avatar-request.dto';
import { UploadAvatarResponseDto } from '../dtos/upload-avatar-response.dto';
import { SignedUrlResponseDto } from '../dtos/signed-url-response.dto';
import { FileValidator } from '../../infrastructure/validators/file.validator';

@Controller('files')
export class FileStorageController {
  constructor(
    private readonly uploadAvatarUseCase: UploadAvatarUseCase,
    private readonly generateSignedUrlUseCase: GenerateSignedUrlUseCase,
  ) {}

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadAvatarRequestDto,
  ): Promise<UploadAvatarResponseDto> {
    try {
      FileValidator.validateUploadedFile(file, body.userId);

      const result = await this.uploadAvatarUseCase.execute({
        userId: body.userId,
        file: file,
      });

      return new UploadAvatarResponseDto(result.url, result.key);
    } catch (error) {
      throw error;
    }
  }

  @Get('signed-url')
  async getSignedUrl(
    @Query('key') key: string,
    @Query('expiresIn', new DefaultValuePipe(3600), ParseIntPipe)
    expiresIn: number,
  ): Promise<SignedUrlResponseDto> {
    if (!key) {
      throw new BadRequestException({
        message: 'Parâmetro "key" é obrigatório',
        code: 'MISSING_KEY',
      });
    }

    try {
      const result = await this.generateSignedUrlUseCase.execute({
        fileKey: key,
        expiresIn: expiresIn,
      });

      return new SignedUrlResponseDto(result.signedUrl, expiresIn, key);
    } catch (error) {
      throw error;
    }
  }
}

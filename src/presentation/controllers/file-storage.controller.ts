import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadAvatarUseCase } from '../../application/use-cases/upload-avatar.use-case';

import { UploadAvatarRequestDto } from '../dtos/upload-avatar-request.dto';
import { UploadAvatarResponseDto } from '../dtos/upload-avatar-response.dto';

import { FileValidator } from '../../infrastructure/validators/file.validator';

@Controller('files')
export class FileStorageController {
  constructor(private readonly uploadAvatarUseCase: UploadAvatarUseCase) {}

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadAvatarRequestDto,
  ): Promise<UploadAvatarResponseDto> {
    FileValidator.validateUploadedFile(file, body.userId);

    const result = await this.uploadAvatarUseCase.execute({
      userId: body.userId,
      file: file,
    });

    return new UploadAvatarResponseDto(
      result.url,
      result.key,
      result.signedUrl,
    );
  }
}

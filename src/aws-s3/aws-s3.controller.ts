import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AwsS3Service } from './aws-s3.service';
import { UploadAvatarDto } from './dto/upload-avatar.dto';

@Controller('upload')
export class AwsS3Controller {
  constructor(private readonly awsS3Service: AwsS3Service) {}

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Body('userId') userId: string,
  ) {
    if (!file) {
      throw new Error('Nenhum arquivo enviado');
    }

    // Gera uma chave única para o arquivo
    const key = `avatars/${userId}-${Date.now()}-${file.originalname}`;

    // Faz upload para S3
    const fileUrl = await this.awsS3Service.uploadFile(
      file.buffer,
      key,
      file.mimetype,
    );

    return {
      message: 'Avatar uploadado com sucesso!',
      url: fileUrl,
      key: key,
    };
  }
}

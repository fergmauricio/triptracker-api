import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AwsS3Service } from './aws-s3.service';

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
      throw new BadRequestException({
        message: 'Nenhum arquivo enviado',
        details: 'Use o campo "file" no form-data para enviar o arquivo',
        code: 'MISSING_FILE',
      });
    }

    if (!userId) {
      throw new BadRequestException({
        message: 'User ID é obrigatório',
        details: 'Inclua o campo "userId" no body da requisição',
        code: 'MISSING_USER_ID',
      });
    }

    if (isNaN(Number(userId))) {
      throw new BadRequestException({
        message: 'User ID inválido',
        details: 'O User ID deve ser um número válido',
        code: 'INVALID_USER_ID',
      });
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new UnsupportedMediaTypeException({
        message: 'Tipo de arquivo não suportado',
        details: `Tipo ${file.mimetype} não é permitido. Use: ${allowedMimeTypes.join(', ')}`,
        code: 'INVALID_FILE_TYPE',
      });
    }

    // Validação de tamanho (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new PayloadTooLargeException({
        message: 'Arquivo muito grande',
        details: `Tamanho máximo permitido: 5MB. Arquivo enviado: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
        code: 'FILE_TOO_LARGE',
      });
    }

    try {
      const key = `avatars/${userId}-${Date.now()}-${file.originalname}`;
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
    } catch (error) {
      console.error('Upload error:', error);
      throw new BadGatewayException(
        'Erro ao comunicar com o serviço de armazenamento',
      );
    }
  }
}

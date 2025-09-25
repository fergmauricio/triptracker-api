import {
  BadRequestException,
  UnsupportedMediaTypeException,
  PayloadTooLargeException,
} from '@nestjs/common';
import { FileType } from '../../domain/value-objects/file-type.vo';
import { FileSize } from '../../domain/value-objects/file-size.vo';

export class FileValidator {
  static validateUploadedFile(file: Express.Multer.File, userId: string): void {
    if (!file) {
      throw new BadRequestException({
        message: 'Nenhum arquivo enviado',
        code: 'MISSING_FILE',
      });
    }

    if (!userId || isNaN(Number(userId))) {
      throw new BadRequestException({
        message: 'User ID inválido',
        code: 'INVALID_USER_ID',
      });
    }

    try {
      new FileType(file.mimetype);
      new FileSize(file.size);
    } catch (error) {
      if (error.message.includes('Tipo de arquivo não suportado')) {
        throw new UnsupportedMediaTypeException({
          message: 'Tipo de arquivo não suportado',
          details: error.message,
          code: 'INVALID_FILE_TYPE',
        });
      }

      if (error.message.includes('Arquivo muito grande')) {
        throw new PayloadTooLargeException({
          message: 'Arquivo muito grande',
          details: error.message,
          code: 'FILE_TOO_LARGE',
        });
      }

      throw new BadRequestException({
        message: 'Arquivo inválido',
        details: error.message,
        code: 'VALIDATION_ERROR',
      });
    }
  }
}

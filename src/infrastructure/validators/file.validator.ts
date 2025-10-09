import { BadRequestException } from '@nestjs/common';

export class FileValidator {
  static validateUploadedFile(
    file: Express.Multer.File,
    entityId?: string,
  ): void {
    if (!file) {
      throw new BadRequestException({
        message: 'Nenhum arquivo enviado',
        code: 'MISSING_FILE',
      });
    }

    if (file.size === 0) {
      throw new BadRequestException({
        message: 'Arquivo vazio',
        code: 'EMPTY_FILE',
      });
    }
  }
}

import { BadRequestException } from '@nestjs/common';

export class FileValidator {
  static validateUploadedFile(
    file: Express.Multer.File,
    entityId: string,
  ): void {
    if (!file) {
      throw new BadRequestException({
        message: 'Nenhum arquivo enviado',
        code: 'MISSING_FILE',
      });
    }

    if (!entityId) {
      throw new BadRequestException({
        message: 'Entity ID inválido',
        code: 'INVALID_ENTITY_ID',
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

import { MulterModuleOptions } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

export const multerConfig: MulterModuleOptions = {
  storage: memoryStorage(), //Usar memória ao invés de disco
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1, // Apenas 1 arquivo por vez
  },
  fileFilter: (req, file, callback) => {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(
        new Error(`Tipo de arquivo não permitido: ${file.mimetype}`),
        false,
      );
    }
  },
};

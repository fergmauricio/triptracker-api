import { Test, TestingModule } from '@nestjs/testing';
import { FileStorageController } from '../file-storage.controller';
import { UploadAvatarUseCase } from '../../../application/use-cases/upload-avatar.use-case';
import { UploadAvatarRequestDto } from '../../dtos/upload-avatar-request.dto';
import { UploadAvatarResponseDto } from '../../dtos/upload-avatar-response.dto';
import { FileValidator } from '../../../infrastructure/validators/file.validator';

describe('FileStorageController', () => {
  let controller: FileStorageController;
  let uploadAvatarUseCase: UploadAvatarUseCase;

  const mockUploadAvatarUseCase = {
    execute: jest.fn(),
  };

  const mockFile = {
    originalname: 'avatar.jpg',
    mimetype: 'image/jpeg',
    size: 5 * 1024 * 1024, // 5MB
    buffer: Buffer.from('fake-image-data'),
    fieldname: 'file',
    encoding: '7bit',
    destination: '',
    filename: 'avatar.jpg',
    path: '',
  } as Express.Multer.File;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileStorageController],
      providers: [
        {
          provide: UploadAvatarUseCase,
          useValue: mockUploadAvatarUseCase,
        },
      ],
    }).compile();

    controller = module.get<FileStorageController>(FileStorageController);
    uploadAvatarUseCase = module.get<UploadAvatarUseCase>(UploadAvatarUseCase);

    jest.clearAllMocks();
  });

  describe('uploadAvatar', () => {
    it('deve fazer upload de avatar com sucesso', async () => {
      // Arrange
      const uploadAvatarDto: UploadAvatarRequestDto = {
        userId: '1',
      };

      const expectedResult = {
        url: 'https://bucket.s3.amazonaws.com/avatars/1-1234567890-avatar.jpg',
        signedUrl: 'https://signed-url.com/avatars/1-1234567890-avatar.jpg',
        key: 'avatars/1-1234567890-avatar.jpg',
      };

      mockUploadAvatarUseCase.execute.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.uploadAvatar(mockFile, uploadAvatarDto);

      // Assert
      expect(result).toBeInstanceOf(UploadAvatarResponseDto);
      expect(result).toEqual({
        message: 'Avatar enviado com sucesso!',
        url: 'https://bucket.s3.amazonaws.com/avatars/1-1234567890-avatar.jpg',
        key: 'avatars/1-1234567890-avatar.jpg',
        signedUrl: 'https://signed-url.com/avatars/1-1234567890-avatar.jpg',
      });

      expect(uploadAvatarUseCase.execute).toHaveBeenCalledWith({
        userId: '1',
        file: mockFile,
      });
    });

    it('deve chamar FileValidator para validar o arquivo', async () => {
      // Arrange
      const uploadAvatarDto: UploadAvatarRequestDto = {
        userId: '1',
      };

      const expectedResult = {
        url: 'https://bucket.s3.amazonaws.com/avatars/1-1234567890-avatar.jpg',
        signedUrl: 'https://signed-url.com/avatars/1-1234567890-avatar.jpg',
        key: 'avatars/1-1234567890-avatar.jpg',
      };

      mockUploadAvatarUseCase.execute.mockResolvedValue(expectedResult);

      const validateSpy = jest.spyOn(FileValidator, 'validateUploadedFile');

      // Act
      await controller.uploadAvatar(mockFile, uploadAvatarDto);

      // Assert
      expect(validateSpy).toHaveBeenCalledWith(mockFile, '1');
      validateSpy.mockRestore();
    });

    it('deve propagar erro do use case', async () => {
      // Arrange
      const uploadAvatarDto: UploadAvatarRequestDto = {
        userId: '1',
      };

      const storageError = new Error('Falha no upload para S3');
      mockUploadAvatarUseCase.execute.mockRejectedValue(storageError);

      // Act & Assert
      await expect(
        controller.uploadAvatar(mockFile, uploadAvatarDto),
      ).rejects.toThrow('Falha no upload para S3');

      expect(uploadAvatarUseCase.execute).toHaveBeenCalledWith({
        userId: '1',
        file: mockFile,
      });
    });

    it('deve lidar com arquivo inválido (validação do FileValidator)', async () => {
      // Arrange
      const uploadAvatarDto: UploadAvatarRequestDto = {
        userId: '1',
      };

      const invalidFile = {
        ...mockFile,
        mimetype: 'application/pdf', // Tipo inválido
      } as Express.Multer.File;

      await expect(
        controller.uploadAvatar(invalidFile, uploadAvatarDto),
      ).rejects.toThrow();

      expect(uploadAvatarUseCase.execute).not.toHaveBeenCalled();
    });

    it('deve lidar com userId inválido', async () => {
      // Arrange
      const uploadAvatarDto: UploadAvatarRequestDto = {
        userId: 'invalid-user-id',
      };

      await expect(
        controller.uploadAvatar(mockFile, uploadAvatarDto),
      ).rejects.toThrow();

      expect(uploadAvatarUseCase.execute).not.toHaveBeenCalled();
    });

    it('deve lidar com arquivo muito grande', async () => {
      const uploadAvatarDto: UploadAvatarRequestDto = {
        userId: '1',
      };

      const largeFile = {
        ...mockFile,
        size: 10 * 1024 * 1024, // 10MB - acima do limite de 5MB
      } as Express.Multer.File;

      await expect(
        controller.uploadAvatar(largeFile, uploadAvatarDto),
      ).rejects.toThrow();

      expect(uploadAvatarUseCase.execute).not.toHaveBeenCalled();
    });
  });
});

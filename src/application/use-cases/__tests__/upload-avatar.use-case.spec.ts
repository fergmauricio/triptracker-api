import { UploadAvatarUseCase } from '../upload-avatar.use-case';
import { FileStorage } from '../../../domain/ports/file-storage.port';
import { IUserRepository } from '../../../domain/ports/user-repository.port';
import { DomainEventPublisher } from '../../../domain/ports/domain-event-publisher.port';
import { UploadAvatarCommand } from '../../../application/commands/upload-avatar-command';
import { User } from '../../../domain/entities/user.entity';
import { UserId } from '../../../domain/value-objects/user-id.vo';

describe('UploadAvatarUseCase', () => {
  let useCase: UploadAvatarUseCase;

  // Mocks
  const mockFileStorage: FileStorage = {
    uploadFile: jest.fn(),
    getSignedUrl: jest.fn(),
    deleteFile: jest.fn(),
  };

  const mockUserRepository: IUserRepository = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    save: jest.fn(),
    existsWithEmail: jest.fn(),
  };

  const mockEventPublisher: DomainEventPublisher = {
    publish: jest.fn(),
    publishAll: jest.fn(),
  };

  const mockFile = {
    originalname: 'avatar.jpg',
    mimetype: 'image/jpeg',
    size: 5 * 1024 * 1024, // 5MB
    buffer: Buffer.from('fake-image-data'),
  } as Express.Multer.File;

  const mockUser = User.fromPersistence(
    1,
    'Maurício',
    'mauricio@triptracking.com.br',
    'hashed-password',
    true,
  );

  beforeEach(() => {
    useCase = new UploadAvatarUseCase(
      mockFileStorage,
      mockUserRepository,
      mockEventPublisher,
    );

    jest.spyOn(console, 'error').mockImplementation(() => {});

    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('deve fazer upload do avatar e atualizar usuário com sucesso', async () => {
      // Arrange
      const command = new UploadAvatarCommand('1', mockFile);
      const expectedFileUrl =
        'https://bucket.s3.amazonaws.com/avatars/1-1234567890-avatar.jpg';
      const expectedSignedUrl =
        'https://signed-url.com/avatars/1-1234567890-avatar.jpg';

      mockFileStorage.uploadFile.mockResolvedValue(expectedFileUrl);
      mockFileStorage.getSignedUrl.mockResolvedValue(expectedSignedUrl);
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(undefined);
      mockEventPublisher.publish.mockResolvedValue(undefined);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result).toEqual({
        url: expectedFileUrl,
        signedUrl: expectedSignedUrl,
        key: expect.stringContaining('avatars/1-'),
      });

      expect(mockFileStorage.uploadFile).toHaveBeenCalledWith(
        mockFile.buffer,
        expect.stringContaining('avatars/1-'),
        'image/jpeg',
      );

      expect(mockFileStorage.getSignedUrl).toHaveBeenCalledWith(
        expect.stringContaining('avatars/1-'),
      );

      expect(mockUserRepository.findById).toHaveBeenCalledWith(
        expect.any(UserId),
      );

      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
      expect(mockUser.getAvatarUrl()).toBe(expectedFileUrl);

      expect(mockEventPublisher.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: '1',
          fileKey: expect.stringContaining('avatars/1-'),
          fileUrl: expectedFileUrl,
        }),
      );
    });

    it('deve lidar com usuário não encontrado', async () => {
      // Arrange
      const command = new UploadAvatarCommand('999', mockFile);
      const expectedFileUrl =
        'https://bucket.s3.amazonaws.com/avatars/999-1234567890-avatar.jpg';
      const expectedSignedUrl =
        'https://signed-url.com/avatars/999-1234567890-avatar.jpg';

      mockFileStorage.uploadFile.mockResolvedValue(expectedFileUrl);
      mockFileStorage.getSignedUrl.mockResolvedValue(expectedSignedUrl);
      mockUserRepository.findById.mockResolvedValue(null); // Usuário não encontrado

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result).toEqual({
        url: expectedFileUrl,
        signedUrl: expectedSignedUrl,
        key: expect.stringContaining('avatars/999-'),
      });

      expect(mockUserRepository.findById).toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();

      expect(mockEventPublisher.publish).toHaveBeenCalled();
    });

    it('deve propagar erros do file storage', async () => {
      // Arrange
      const command = new UploadAvatarCommand('1', mockFile);
      const storageError = new Error('Falha no upload para S3');

      mockFileStorage.uploadFile.mockRejectedValue(storageError);

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow(
        'Falha no upload para S3',
      );

      // Verifica que nenhuma outra operação foi tentada
      expect(mockFileStorage.getSignedUrl).not.toHaveBeenCalled();
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
      expect(mockEventPublisher.publish).not.toHaveBeenCalled();
    });

    it('deve propagar erro na publicação do evento', async () => {
      // Arrange
      const command = new UploadAvatarCommand('1', mockFile);
      const expectedFileUrl =
        'https://bucket.s3.amazonaws.com/avatars/1-1234567890-avatar.jpg';
      const expectedSignedUrl =
        'https://signed-url.com/avatars/1-1234567890-avatar.jpg';

      mockFileStorage.uploadFile.mockResolvedValue(expectedFileUrl);
      mockFileStorage.getSignedUrl.mockResolvedValue(expectedSignedUrl);
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(undefined);

      mockEventPublisher.publish.mockRejectedValue(
        new Error('Falha no RabbitMQ'),
      );

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow(
        'Falha no RabbitMQ',
      );

      expect(mockFileStorage.uploadFile).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(mockEventPublisher.publish).toHaveBeenCalled();
    });
  });
});

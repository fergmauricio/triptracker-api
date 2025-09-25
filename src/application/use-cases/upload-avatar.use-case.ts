import { Injectable } from '@nestjs/common';
import { FileStorage } from '../../domain/ports/file-storage.port';
import { IUserRepository } from '../../domain/ports/user-repository.port';
import { DomainEventPublisher } from '../../domain/ports/domain-event-publisher.port';
import { UploadAvatarCommand } from '../dtos/upload-avatar-command';
import { FileKey } from '../../domain/value-objects/file-key.vo';
import { FileType } from '../../domain/value-objects/file-type.vo';
import { FileSize } from '../../domain/value-objects/file-size.vo';
import { AvatarUploadedEvent } from '../../domain/domain-events/avatar-uploaded.event';

@Injectable()
export class UploadAvatarUseCase {
  constructor(
    private readonly fileStorage: FileStorage,
    private readonly userRepository: IUserRepository,
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async execute(
    command: UploadAvatarCommand,
  ): Promise<{ url: string; key: string }> {
    try {
      const fileType = new FileType(command.file.mimetype);
      const fileSize = new FileSize(command.file.size);

      const fileKey = FileKey.createAvatarKey(
        command.userId,
        command.file.originalname,
      );

      const fileUrl = await this.fileStorage.uploadFile(
        command.file.buffer,
        fileKey.getValue(),
        fileType.getValue(),
      );

      const user = await this.userRepository.findById(command.userId);
      if (user) {
        user.updateAvatar(fileUrl);
        await this.userRepository.save(user);
      }

      const event = new AvatarUploadedEvent(
        command.userId,
        fileKey.getValue(),
        fileUrl,
      );
      await this.eventPublisher.publish(event);

      return {
        url: fileUrl,
        key: fileKey.getValue(),
      };
    } catch (error) {
      console.error('UploadAvatarUseCase error:', error);
      throw error;
    }
  }
}

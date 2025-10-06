import { Injectable } from '@nestjs/common';
import type { FileStorage } from '../../domain/ports/file-storage.port';
import type { IUserRepository } from '../../domain/ports/user-repository.port';

import { FileKey } from '../../domain/value-objects/file-key.vo';
import { FileType } from '../../domain/value-objects/file-type.vo';
import { FileSize } from '../../domain/value-objects/file-size.vo';
import { AvatarUploadedEvent } from '../../domain/domain-events/avatar-uploaded.event';
import { UploadAvatarCommand } from '@application/commands/upload-avatar-command';
import type { DomainEventPublisher } from '@domain/ports/domain-event-publisher.port';
import { UserId } from '@domain/value-objects/user-id.vo';
import { UploadConfig } from '@domain/value-objects/upload-config.vo';

@Injectable()
export class UploadAvatarUseCase {
  constructor(
    private readonly fileStorage: FileStorage,
    private readonly userRepository: IUserRepository,
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async execute(
    command: UploadAvatarCommand,
  ): Promise<{ url: string; signedUrl: string; key: string }> {
    try {
      const config = UploadConfig.create('avatar');

      const fileType = new FileType(command.file.mimetype);
      const fileSize = new FileSize(command.file.size);

      if (!fileSize.isWithinLimit(config.getMaxSize())) {
        throw new Error(`ARQUIVO_MUITO_GRANDE: ${fileSize.formatSize()}`);
      }

      const fileKey = FileKey.create(
        'avatars',
        command.userId,
        command.file.originalname,
      );

      const fileUrl = await this.fileStorage.uploadFile(
        command.file.buffer,
        fileKey.getValue(),
        fileType.getValue(),
      );

      const signedUrl = await this.fileStorage.getSignedUrl(fileKey.getValue());

      const userIdVO = new UserId(parseInt(command.userId));

      const user = await this.userRepository.findById(userIdVO);

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
        signedUrl: signedUrl,
        key: fileKey.getValue(),
      };
    } catch (error) {
      console.error('UploadAvatarUseCase error:', error);
      throw error;
    }
  }
}

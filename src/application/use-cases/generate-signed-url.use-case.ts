import { Injectable } from '@nestjs/common';
import { FileStorage } from '../../domain/ports/file-storage.port';
import { FileKey } from '../../domain/value-objects/file-key.vo';
import { GenerateSignedUrlCommand } from '../dtos/generate-signed-url-command';

@Injectable()
export class GenerateSignedUrlUseCase {
  constructor(private readonly fileStorage: FileStorage) {}

  async execute(
    command: GenerateSignedUrlCommand,
  ): Promise<{ signedUrl: string }> {
    const fileKey = new FileKey(command.fileKey);

    const signedUrl = await this.fileStorage.getSignedUrl(
      fileKey.getValue(),
      command.expiresIn,
    );

    return { signedUrl };
  }
}

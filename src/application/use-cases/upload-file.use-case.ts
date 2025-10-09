import { FileKey } from '../../domain/value-objects/file-key.vo';
import { FileType } from '../../domain/value-objects/file-type.vo';
import { FileSize } from '../../domain/value-objects/file-size.vo';
import { UploadConfig } from '../../domain/value-objects/upload-config.vo';
import type { FileStorage } from '../../domain/ports/file-storage.port';
import type { DomainEventPublisher } from '../../domain/ports/domain-event-publisher.port';
import { FileUploadedEvent } from '../../domain/domain-events/file-uploaded.event';
import { UploadFileCommand } from '@application/commands/upload-file-command';
import { StructuredLoggerService } from '@infrastructure/adapters/external/logging/structured-logger.service';

export class UploadFileUseCase {
  constructor(
    private readonly fileStorage: FileStorage,
    private readonly eventPublisher: DomainEventPublisher,
    private readonly logger: StructuredLoggerService,
  ) {}

  async execute(
    command: UploadFileCommand,
  ): Promise<{ url: string; key: string; signedUrl: string }> {
    this.logger.log('Iniciando upload de arquivo', 'UploadFileUseCase', {
      category: command.category,
      entityId: command.entityId,
      originalName: command.file.originalname,
      mimeType: command.file.mimetype,
      size: command.file.size,
    });

    try {
      const config = UploadConfig.create(command.category);

      const fileType = new FileType(command.file.mimetype);

      const fileSize = new FileSize(command.file.size);
      if (!fileSize.isWithinLimit(config.getMaxSize())) {
        throw new Error(`ARQUIVO_MUITO_GRANDE: ${fileSize.formatSize()}`);
      }

      if (!config.isTypeAllowed(fileType.getValue())) {
        throw new Error('TIPO_ARQUIVO_NAO_PERMITIDO_CATEGORIA');
      }

      const fileKey = FileKey.create(
        config.getCategory() as any,
        command.file.originalname,
        command.entityId,
      );

      const fileUrl = await this.fileStorage.uploadFile(
        command.file.buffer,
        fileKey.getValue(),
        command.file.mimetype,
      );

      // Gerar URL assinada
      const signedUrl = await this.fileStorage.getSignedUrl(fileKey.getValue());

      // Publicar evento
      const event = new FileUploadedEvent(
        fileKey.getValue(),
        fileUrl,
        config.getCategory(),
        command.entityId,
      );

      await this.eventPublisher.publish(event);

      this.logger.log('Upload concluído com sucesso', 'UploadFileUseCase', {
        category: command.category,
        entityId: command.entityId,
        fileKey: fileKey.getValue(),
        fileUrl,
      });

      return {
        url: fileUrl,
        key: fileKey.getValue(),
        signedUrl,
      };
    } catch (error) {
      this.logger.error(
        'Falha no upload de arquivo',
        error.stack,
        'UploadFileUseCase',
        {
          category: command.category,
          error: error.message,
          entityId: command.entityId,
        },
      );
      throw error;
    }
  }
}

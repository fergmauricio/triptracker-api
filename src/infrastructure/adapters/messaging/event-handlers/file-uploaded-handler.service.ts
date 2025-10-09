import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class FileUploadedEventHandler {
  private readonly logger = new Logger(FileUploadedEventHandler.name);

  async handle(event: any): Promise<void> {
    if (event.eventType !== 'FileUploadedEvent') {
      return;
    }

    try {
      const { fileKey, fileUrl, category, entityId } = event.eventData;

      this.logger.log(`Arquivo enviado processado: ${fileKey}`, {
        category,
        fileUrl,
        entityId,
      });

      switch (category) {
        case 'avatar':
          await this.handleAvatarUpload(entityId, fileUrl);
          break;
        case 'trip':
          await this.handleTripThumbUpload(entityId, fileUrl);
          break;
        case 'card':
          await this.handleCardImageUpload(entityId, fileUrl);
          break;
        default:
          this.logger.warn(`Categoria não tratada: ${category}`);
      }
    } catch (error) {
      this.logger.error(`Falha ao processar upload de arquivo:`, error);
      // Não throw error para não quebrar o pipeline de eventos
    }
  }

  private async handleAvatarUpload(
    userId: string,
    fileUrl: string,
  ): Promise<void> {
    this.logger.log(`Processando avatar do usuário ${userId}`);
    // TODO: Atualizar profile user
  }

  private async handleTripThumbUpload(
    tripId: string,
    fileUrl: string,
  ): Promise<void> {
    this.logger.log(`Processando thumbnail da viagem ${tripId}`);
    // TODO: Atualizar thumb de trips
  }

  private async handleCardImageUpload(
    cardId: string,
    fileUrl: string,
  ): Promise<void> {
    this.logger.log(`Processando imagem do card ${cardId}`);
    // TODO: Atualizar cards
  }
}

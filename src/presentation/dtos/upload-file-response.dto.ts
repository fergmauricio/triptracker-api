import { ApiProperty } from '@nestjs/swagger';

export class UploadFileResponseDto {
  @ApiProperty({
    description: 'Mensagem de confirmação',
    example: 'Arquivo enviado com sucesso!',
  })
  message: string;

  @ApiProperty({
    description: 'URL pública do arquivo',
    example:
      'https://bucket.s3.region.amazonaws.com/trips/1-1234567890-image.jpg',
  })
  url: string;

  @ApiProperty({
    description: 'Chave única do arquivo no storage',
    example: 'trips/1-1234567890-image.jpg',
  })
  key: string;

  @ApiProperty({
    description: 'URL assinada para acesso temporário',
    example: 'https://signed-url.com/trips/1-1234567890-image.jpg?token=abc123',
  })
  signedUrl: string;

  @ApiProperty({
    description: 'Categoria do arquivo',
    example: 'trips',
  })
  category: string;

  @ApiProperty({
    description: 'ID da entidade associada',
    example: '1',
  })
  entityId: string;

  constructor(
    url: string,
    key: string,
    signedUrl: string,
    category: string,
    entityId: string,
  ) {
    this.message = 'Arquivo enviado com sucesso!';
    this.url = url;
    this.key = key;
    this.signedUrl = signedUrl;
    this.category = category;
    this.entityId = entityId;
  }
}

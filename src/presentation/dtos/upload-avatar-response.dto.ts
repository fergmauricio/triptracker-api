import { ApiProperty } from '@nestjs/swagger';

export class UploadAvatarResponseDto {
  @ApiProperty({
    description: 'Mensagem de confirmação',
    example: 'Avatar enviado com sucesso!',
  })
  message: string;

  @ApiProperty({
    description: 'URL pública do arquivo',
    example: 'https://triptracking.com.br/avatars/1-1234567890-avatar.jpg',
  })
  url: string;

  @ApiProperty({
    description: 'Chave única do arquivo no storage',
    example: 'avatars/1-1234567890-avatar.jpg',
  })
  key: string;

  @ApiProperty({
    description: 'URL assinada para acesso temporário',
    example:
      'https://signed-url.com/avatars/1-1234567890-avatar.jpg?token=abc123',
  })
  signedUrl: string;

  constructor(url: string, key: string, signedUrl: string) {
    this.message = 'Avatar enviado com sucesso!';
    this.url = url;
    this.key = key;
    this.signedUrl = signedUrl;
  }
}

import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT Token para autenticação',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({
    description: 'ID do usuário',
    example: 1,
  })
  user_id: number;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'email@email.com',
  })
  email: string;

  @ApiProperty({
    description: 'Nome do usuário',
    example: 'Nome e Sobrenome',
  })
  name: string;

  constructor(
    accessToken: string,
    userId: number,
    email: string,
    name: string,
  ) {
    this.access_token = accessToken;
    this.user_id = userId;
    this.email = email;
    this.name = name;
  }
}

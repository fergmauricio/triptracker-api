import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TripResponseDto {
  @ApiProperty({
    description: 'ID da viagem',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Título da viagem',
    example: 'Viagem para o Rio de Janeiro',
  })
  title: string;

  @ApiPropertyOptional({
    description: 'Descrição da viagem',
    example: 'Uma viagem incrível para conhecer o Rio',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'URL da imagem de capa',
    example: 'https://example.com/thumb.jpg',
  })
  thumb?: string;

  @ApiPropertyOptional({
    description: 'Data de início da viagem',
    example: '2024-12-01T00:00:00.000Z',
  })
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'Data de fim da viagem',
    example: '2024-12-10T00:00:00.000Z',
  })
  endDate?: Date;

  @ApiProperty({
    description: 'ID do usuário criador',
    example: 1,
  })
  userId: number;

  @ApiProperty({
    description: 'Data de criação',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'Data de última atualização',
    example: '2024-01-02T00:00:00.000Z',
  })
  updatedAt?: Date;

  constructor(
    id: number,
    title: string,
    userId: number,
    createdAt: Date,
    description?: string,
    thumb?: string,
    startDate?: Date,
    endDate?: Date,
    updatedAt?: Date,
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.thumb = thumb;
    this.startDate = startDate;
    this.endDate = endDate;
    this.userId = userId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

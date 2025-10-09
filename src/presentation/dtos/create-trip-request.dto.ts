import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDateString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateTripRequestDto {
  @ApiProperty({
    description:
      'Título da viagem - O usuário será automaticamente associado via token JWT',
    example: 'Viagem para o Rio de Janeiro',
    maxLength: 100,
  })
  @IsString()
  @MinLength(1, { message: 'O título não pode estar vazio' })
  @MaxLength(100, { message: 'O título não pode ter mais de 100 caracteres' })
  title: string;

  @ApiPropertyOptional({
    description: 'Descrição da viagem',
    example: 'Uma viagem incrível para conhecer o Rio',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500, {
    message: 'A descrição não pode ter mais de 500 caracteres',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'URL da imagem de capa',
    type: 'string',
    format: 'binary',
    example: 'https://example.com/thumb.jpg',
  })
  @IsString()
  @IsOptional()
  thumb?: string;

  @ApiPropertyOptional({
    description: 'Data de início da viagem',
    example: '2024-12-01T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'Data de fim da viagem',
    example: '2024-12-10T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  endDate?: Date;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDateString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateTripRequestDto {
  @ApiPropertyOptional({
    description: 'Título da viagem',
    example: 'Viagem atualizada para o Rio',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MinLength(1, { message: 'O título não pode estar vazio' })
  @MaxLength(100, { message: 'O título não pode ter mais de 100 caracteres' })
  title?: string;

  @ApiPropertyOptional({
    description: 'Descrição da viagem',
    example: 'Descrição atualizada da viagem',
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
    example: 'https://example.com/new-thumb.jpg',
  })
  @IsString()
  @IsOptional()
  thumb?: string;

  @ApiPropertyOptional({
    description: 'Data de início da viagem',
    example: '2024-12-02T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'Data de fim da viagem',
    example: '2024-12-12T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  endDate?: Date;
}

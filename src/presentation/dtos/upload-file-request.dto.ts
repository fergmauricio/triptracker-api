import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum FileCategory {
  AVATAR = 'avatar',
  TRIP = 'trip',
  CARD = 'card',
}

export class UploadFileRequestDto {
  @ApiProperty({
    description: 'Categoria do arquivo',
    enum: FileCategory,
    example: FileCategory.AVATAR,
  })
  @IsEnum(FileCategory, { message: 'Categoria deve ser: avatar, trip ou card' })
  @IsNotEmpty({ message: 'Categoria é obrigatória' })
  category: FileCategory;

  @ApiProperty({
    description:
      'ID da entidade associada. Para avatar: userId, para trip: tripId, para card: cardId',
    example: '1',
  })
  @IsNotEmpty({ message: 'Entity ID é obrigatório' })
  @IsString({ message: 'Entity ID deve ser uma string' })
  entityId: string;
}

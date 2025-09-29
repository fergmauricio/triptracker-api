import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString } from 'class-validator';

export class UploadAvatarRequestDto {
  @ApiProperty({
    description: 'ID do usuário',
    example: '1',
    type: String,
  })
  @IsNotEmpty({ message: 'User ID é obrigatório' })
  @IsNumberString({}, { message: 'User ID deve ser um número válido' })
  userId: string;
}

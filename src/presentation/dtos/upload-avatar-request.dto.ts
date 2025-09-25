import { IsNotEmpty, IsNumberString } from 'class-validator';

export class UploadAvatarRequestDto {
  @IsNotEmpty({ message: 'User ID é obrigatório' })
  @IsNumberString({}, { message: 'User ID deve ser um número válido' })
  userId: string;
}

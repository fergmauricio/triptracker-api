import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  UseFilters,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadAvatarUseCase } from '../../application/use-cases/upload-avatar.use-case';
import { UploadAvatarRequestDto } from '../dtos/upload-avatar-request.dto';
import { UploadAvatarResponseDto } from '../dtos/upload-avatar-response.dto';
import { FileValidator } from '../../infrastructure/validators/file.validator';
import { FileUploadExceptionFilter } from '../filters/file-upload-exception.filter';

@ApiTags('files')
@Controller('files')
@UseFilters(FileUploadExceptionFilter)
@Controller('files')
export class FileStorageController {
  constructor(private readonly uploadAvatarUseCase: UploadAvatarUseCase) {}

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload de avatar do usuário',
    description:
      'Faz upload de imagem de avatar para o usuário especificado. Formatos suportados: JPEG, PNG, GIF. Tamanho máximo: 5MB.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Arquivo de imagem e ID do usuário',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo de imagem (JPEG, PNG, GIF)',
        },
        userId: {
          type: 'string',
          description: 'ID do usuário',
          example: '1',
        },
      },
      required: ['file', 'userId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Avatar enviado com sucesso',
    type: UploadAvatarResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Arquivo inválido - tipo não suportado, tamanho excessivo ou userId inválido',
    schema: {
      example: {
        success: false,
        timestamp: '2024-01-01T00:00:00.000Z',
        path: '/files/avatar',
        error: {
          message: 'Tipo de arquivo não suportado',
          code: 'INVALID_FILE_TYPE',
          details: 'Tipo de arquivo não suportado: application/pdf',
        },
      },
    },
  })
  @ApiResponse({
    status: 413,
    description: 'Arquivo muito grande',
    schema: {
      example: {
        success: false,
        timestamp: '2024-01-01T00:00:00.000Z',
        path: '/files/avatar',
        error: {
          message: 'Arquivo muito grande',
          code: 'FILE_TOO_LARGE',
          details: 'Arquivo muito grande: 6.00MB',
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno no servidor ou serviço de storage indisponível',
    schema: {
      example: {
        success: false,
        timestamp: '2024-01-01T00:00:00.000Z',
        path: '/files/avatar',
        error: {
          message: 'Falha no upload para S3',
          code: 'STORAGE_ERROR',
          details: null,
        },
      },
    },
  })
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadAvatarRequestDto,
  ): Promise<UploadAvatarResponseDto> {
    FileValidator.validateUploadedFile(file, body.userId);

    const result = await this.uploadAvatarUseCase.execute({
      userId: body.userId,
      file: file,
    });

    return new UploadAvatarResponseDto(
      result.url,
      result.key,
      result.signedUrl,
    );
  }
}

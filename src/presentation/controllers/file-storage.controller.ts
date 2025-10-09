import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UnsupportedMediaTypeException,
  PayloadTooLargeException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { UploadFileUseCase } from '../../application/use-cases';
import { UploadFileRequestDto, UploadFileResponseDto } from '../dtos';

@ApiTags('files')
@ApiBearerAuth()
@Controller('files')
export class FileStorageController {
  constructor(private readonly uploadFileUseCase: UploadFileUseCase) {}

  @Post('upload')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload de arquivo genérico',
    description:
      'Faz upload de arquivos para diferentes categorias (avatar, trip, card)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo para upload (imagens ou PDF)',
        },
        category: {
          type: 'string',
          enum: ['avatar', 'trip', 'card'],
          example: 'avatar',
        },
        entityId: {
          type: 'string',
          example: '1',
        },
      },
      required: ['file', 'category'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Arquivo enviado com sucesso',
    type: UploadFileResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados de entrada inválidos',
  })
  @ApiResponse({
    status: 415,
    description: 'Tipo de arquivo não suportado',
  })
  @ApiResponse({
    status: 413,
    description: 'Arquivo muito grande',
  })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadFileRequestDto: UploadFileRequestDto,
  ): Promise<UploadFileResponseDto> {
    try {
      this.validateUploadedFile(file, uploadFileRequestDto.entityId);

      const result = await this.uploadFileUseCase.execute({
        file,
        category: uploadFileRequestDto.category,
        entityId: uploadFileRequestDto.entityId,
      });

      return new UploadFileResponseDto(
        result.url,
        result.key,
        result.signedUrl,
        uploadFileRequestDto.category,
        uploadFileRequestDto.entityId,
      );
    } catch (error) {
      this.handleUploadError(error);
    }
  }

  private validateUploadedFile(
    file: Express.Multer.File,
    entityId?: string,
  ): void {
    if (!file) {
      throw new BadRequestException({
        message: 'Nenhum arquivo enviado',
        details: 'Selecione um arquivo para upload',
        code: 'MISSING_FILE',
      });
    }
  }

  private handleUploadError(error: any): never {
    switch (error.message) {
      case 'FILE_KEY_INVALIDA':
        throw new BadRequestException({
          message: 'Chave de arquivo inválida',
          details: 'A chave gerada para o arquivo é inválida',
          code: 'INVALID_FILE_KEY',
        });

      case 'TIPO_ARQUIVO_NAO_SUPORTADO':
        throw new UnsupportedMediaTypeException({
          message: 'Tipo de arquivo não suportado',
          details: 'O tipo de arquivo enviado não é suportado pelo sistema',
          code: 'UNSUPPORTED_FILE_TYPE',
        });

      case 'ARQUIVO_MUITO_GRANDE':
        throw new PayloadTooLargeException({
          message: 'Arquivo muito grande',
          details: error.message,
          code: 'FILE_TOO_LARGE',
        });

      case 'TIPO_ARQUIVO_NAO_PERMITIDO_CATEGORIA':
        throw new BadRequestException({
          message: 'Tipo de arquivo não permitido para esta categoria',
          details:
            'Verifique os tipos de arquivo permitidos para esta categoria',
          code: 'INVALID_FILE_TYPE_FOR_CATEGORY',
        });

      case 'CATEGORIA_UPLOAD_INVALIDA':
        throw new BadRequestException({
          message: 'Categoria de upload inválida',
          details: 'A categoria deve ser: avatar, trip ou card',
          code: 'INVALID_UPLOAD_CATEGORY',
        });

      default:
        throw new BadRequestException({
          message: 'Erro no upload do arquivo',
          details: error.message || 'Erro interno',
          code: 'UPLOAD_ERROR',
        });
    }
  }
}

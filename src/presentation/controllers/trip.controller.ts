import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Delete,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiConsumes,
} from '@nestjs/swagger';
import {
  CreateTripUseCase,
  GetTripUseCase,
  UpdateTripUseCase,
  DeleteTripUseCase,
  GetUserTripsUseCase,
} from '../../application/use-cases';
import {
  CreateTripRequestDto,
  UpdateTripRequestDto,
  TripResponseDto,
} from '../dtos';
import { JwtAuthGuard } from '@infrastructure/adapters/auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('trips')
@ApiBearerAuth()
@Controller('trips')
@UseGuards(JwtAuthGuard)
export class TripController {
  constructor(
    private readonly createTripUseCase: CreateTripUseCase,
    private readonly getTripUseCase: GetTripUseCase,
    private readonly updateTripUseCase: UpdateTripUseCase,
    private readonly deleteTripUseCase: DeleteTripUseCase,
    private readonly getUserTripsUseCase: GetUserTripsUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('thumb'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Criar nova viagem',
    description: 'Cria uma nova viagem para o usuário autenticado',
  })
  @ApiBody({ type: CreateTripRequestDto })
  @ApiResponse({
    status: 201,
    description: 'Viagem criada com sucesso',
    type: TripResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados de entrada inválidos',
  })
  async createTrip(
    @UploadedFile() thumbFile: Express.Multer.File,

    @Body() createTripRequestDto: CreateTripRequestDto,
    @Request() req,
  ): Promise<TripResponseDto> {
    try {
      const result = await this.createTripUseCase.execute({
        title: createTripRequestDto.title,
        description: createTripRequestDto.description || null,
        thumbFile: thumbFile || null,
        startDate: createTripRequestDto.startDate || null,
        endDate: createTripRequestDto.endDate || null,
        userId: req.user.id,
      });

      // Buscar a trip completa para response
      const trip = await this.getTripUseCase.execute(
        result.tripId,
        req.user.id,
      );

      return new TripResponseDto(
        trip.id,
        trip.title,
        trip.userId,
        trip.createdAt,
        trip.description,
        trip.thumb, // ← Já vem com signedUrl
        trip.startDate,
        trip.endDate,
        trip.updatedAt,
      );
    } catch (error) {
      this.handleUseCaseError(error);
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Listar viagens do usuário',
    description: 'Retorna todas as viagens do usuário autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de viagens recuperada com sucesso',
    type: [TripResponseDto],
  })
  async getUserTrips(@Request() req): Promise<TripResponseDto[]> {
    try {
      const trips = await this.getUserTripsUseCase.execute(req.user.id);

      return trips.map(
        (trip) =>
          new TripResponseDto(
            trip.id,
            trip.title,
            trip.userId,
            trip.createdAt,
            trip.description,
            trip.thumb,
            trip.startDate,
            trip.endDate,
            trip.updatedAt,
          ),
      );
    } catch (error) {
      this.handleUseCaseError(error);
    }
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obter viagem por ID',
    description: 'Retorna os detalhes de uma viagem específica',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da viagem',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Viagem recuperada com sucesso',
    type: TripResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Viagem não encontrada',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado à viagem',
  })
  async getTrip(
    @Param('id') id: string,
    @Request() req,
  ): Promise<TripResponseDto> {
    try {
      const trip = await this.getTripUseCase.execute(parseInt(id), req.user.id);

      return new TripResponseDto(
        trip.id,
        trip.title,
        trip.userId,
        trip.createdAt,
        trip.description,
        trip.thumb,
        trip.startDate,
        trip.endDate,
        trip.updatedAt,
      );
    } catch (error) {
      this.handleUseCaseError(error);
    }
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Atualizar viagem',
    description: 'Atualiza os dados de uma viagem existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da viagem',
    type: Number,
  })
  @ApiBody({ type: UpdateTripRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Viagem atualizada com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Viagem não encontrada',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado à viagem',
  })
  async updateTrip(
    @Param('id') id: string,
    @Body() updateTripRequestDto: UpdateTripRequestDto,
    @Request() req,
  ): Promise<{ message: string }> {
    try {
      await this.updateTripUseCase.execute({
        tripId: parseInt(id),
        title: updateTripRequestDto.title,
        description: updateTripRequestDto.description,
        thumb: updateTripRequestDto.thumb,
        startDate: updateTripRequestDto.startDate,
        endDate: updateTripRequestDto.endDate,
        userId: req.user.id,
      });

      return {
        message: 'Viagem atualizada com sucesso',
      };
    } catch (error) {
      this.handleUseCaseError(error);
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Excluir viagem',
    description: 'Exclui uma viagem existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da viagem',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Viagem excluída com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Viagem não encontrada',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado à viagem',
  })
  async deleteTrip(
    @Param('id') id: string,
    @Request() req,
  ): Promise<{ message: string }> {
    try {
      await this.deleteTripUseCase.execute(parseInt(id), req.user.id);

      return {
        message: 'Viagem excluída com sucesso',
      };
    } catch (error) {
      this.handleUseCaseError(error);
    }
  }

  private handleUseCaseError(error: any): never {
    switch (error.message) {
      case 'TÍTULO_VIAGEM_VAZIO':
        throw new BadRequestException({
          message: 'Título da viagem não pode estar vazio',
          details: 'Informe um título para a viagem',
          code: 'EMPTY_TRIP_TITLE',
        });

      case 'TÍTULO_VIAGEM_MUITO_LONGO':
        throw new BadRequestException({
          message: 'Título da viagem muito longo',
          details: 'O título não pode ter mais de 100 caracteres',
          code: 'TRIP_TITLE_TOO_LONG',
        });

      case 'DESCRIÇÃO_VIAGEM_MUITO_LONGA':
        throw new BadRequestException({
          message: 'Descrição da viagem muito longa',
          details: 'A descrição não pode ter mais de 500 caracteres',
          code: 'TRIP_DESCRIPTION_TOO_LONG',
        });

      case 'DATA_INICIO_MAIOR_DATA_FIM':
        throw new BadRequestException({
          message: 'Data de início maior que data de fim',
          details: 'A data de início não pode ser posterior à data de fim',
          code: 'INVALID_DATE_RANGE',
        });

      case 'ID_VIAGEM_INVÁLIDO':
        throw new BadRequestException({
          message: 'ID da viagem inválido',
          details: 'O ID da viagem deve ser um número válido',
          code: 'INVALID_TRIP_ID',
        });

      case 'VIAGEM_NAO_ENCONTRADA':
        throw new NotFoundException({
          message: 'Viagem não encontrada',
          details: 'A viagem solicitada não existe',
          code: 'TRIP_NOT_FOUND',
        });

      case 'ACESSO_NEGADO_VIAGEM':
        throw new ForbiddenException({
          message: 'Acesso negado',
          details: 'Você não tem permissão para acessar esta viagem',
          code: 'TRIP_ACCESS_DENIED',
        });

      default:
        throw new BadRequestException({
          message: 'Erro na solicitação',
          details: error.message || 'Erro interno',
          code: 'VALIDATION_ERROR',
        });
    }
  }
}

import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';

@Catch() // Captura todas as exceptions
export class FileUploadExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const errorResponse = {
      success: false,
      timestamp: new Date().toISOString(),
      path: ctx.getRequest().url,
      error: {
        message: exception.message || 'Erro interno do servidor',
        code: exception.response?.code || 'INTERNAL_ERROR',
        details: exception.response?.details || null,
      },
    };

    response.status(exception.status || 500).json(errorResponse);
  }
}

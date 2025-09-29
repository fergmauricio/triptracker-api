import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as rateLimit from 'express-rate-limit';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
      error: 'Muitas requisições',
      message: 'Limite de requisições excedido. Tente novamente em 15 minutos.',
      statusCode: 429,
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use(limiter);

  app.enableCors({
    origin: [
      'http://localhost:3000', // Frontend local
      'http://localhost:5173', // Vite/Reactt
      'https://triptrackingapi-production.up.railway.app', // Production API
      process.env.FRONTEND_URL,
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: false,
      dismissDefaultMessages: true,
      exceptionFactory: (errors) => {
        const firstError = errors[0];
        const constraints = firstError?.constraints || {};
        const values = Object.values(constraints) || 'Dados inválidos';
        const message = values.filter((msg) => msg !== '');

        return new BadRequestException(
          message.length === 1 ? message[0] : message,
        );
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('TripTracking API')
    .setDescription('API para gerenciamento de viagens e itinerários')
    .setVersion('1.0')
    .addTag('auth', 'Operações de autenticação')
    .addTag('files', 'Upload e gerenciamento de arquivos')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

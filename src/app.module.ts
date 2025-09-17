// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Isso torna as variáveis de ambiente disponíveis em toda a aplicação
    }),
    PrismaModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { QueueModule } from './queue/queue.module';
import { EmailWorkerService } from './workers/email-worker.service';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true, // Isso torna as variáveis de ambiente disponíveis em toda a aplicação
    }),
    PrismaModule,
    QueueModule,
    EmailModule,
  ],
  controllers: [],
  providers: [EmailWorkerService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { EmailService } from './email/email.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule], // Para acessar variáveis de ambiente
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}

import { Module } from '@nestjs/common';
import { EmailWorkerService } from './email-worker.service';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [ConfigModule, EmailModule],
  providers: [EmailWorkerService],
  exports: [EmailWorkerService],
})
export class WorkersModule {}

import { Module } from '@nestjs/common';
import { EmailWorkerService } from './email-worker.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [EmailWorkerService],
  exports: [EmailWorkerService],
})
export class WorkersModule {}

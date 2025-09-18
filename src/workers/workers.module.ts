// src/workers/workers.module.ts
import { Module } from '@nestjs/common';
import { EmailWorkerService } from './email-worker.service';

@Module({
  providers: [EmailWorkerService],
})
export class WorkersModule {}

// src/queue/queue.service.ts
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class QueueService {
  constructor(@InjectQueue('email') private readonly emailQueue: Queue) {}

  async addEmailJob(data: any) {
    await this.emailQueue.add('send-password-reset', data);
  }
}

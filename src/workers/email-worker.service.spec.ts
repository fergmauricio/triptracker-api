import { Test, TestingModule } from '@nestjs/testing';
import { EmailWorkerService } from './email-worker.service';

describe('EmailWorkerService', () => {
  let service: EmailWorkerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailWorkerService],
    }).compile();

    service = module.get<EmailWorkerService>(EmailWorkerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

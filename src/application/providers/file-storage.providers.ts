import { Provider } from '@nestjs/common';
import { UploadFileUseCase } from '../use-cases';

export const fileStorageProviders: Provider[] = [
  {
    provide: UploadFileUseCase,
    useFactory: (fileStorage, eventPublisher, logger) =>
      new UploadFileUseCase(fileStorage, eventPublisher, logger),
    inject: ['FILE_STORAGE', 'DOMAIN_EVENT_PUBLISHER', 'STRUCTURED_LOGGER'],
  },
];

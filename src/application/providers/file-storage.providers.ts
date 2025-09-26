import { Provider } from '@nestjs/common';
import { UploadAvatarUseCase } from '../use-cases/upload-avatar.use-case';

import {
  USER_REPOSITORY,
  DOMAIN_EVENT_PUBLISHER,
  FILE_STORAGE,
} from '../../infrastructure/providers';

export const fileStorageProviders: Provider[] = [
  {
    provide: UploadAvatarUseCase,
    useFactory: (fileStorage, userRepository, eventPublisher) =>
      new UploadAvatarUseCase(fileStorage, userRepository, eventPublisher),
    inject: [FILE_STORAGE, USER_REPOSITORY, DOMAIN_EVENT_PUBLISHER],
  },
];

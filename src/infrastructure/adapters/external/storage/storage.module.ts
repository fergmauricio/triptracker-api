import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AwsS3Adapter } from './aws-s3.adapter';
import { FILE_STORAGE } from '../../../providers';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: FILE_STORAGE,
      useClass: AwsS3Adapter,
    },
    AwsS3Adapter,
  ],
  exports: [FILE_STORAGE, AwsS3Adapter],
})
export class StorageModule {}

import { Module } from '@nestjs/common';
import { AssetsController } from './assets.controller';
import { AwsS3Module } from '../aws-s3/aws-s3.module';

@Module({
  imports: [AwsS3Module],
  controllers: [AssetsController],
})
export class AssetsModule {}

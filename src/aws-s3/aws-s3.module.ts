import { Module } from '@nestjs/common';
import { AwsS3Service } from './aws-s3.service';
import { ConfigModule } from '@nestjs/config';
import { AwsS3Controller } from './aws-s3.controller';

@Module({
  imports: [ConfigModule],
  controllers: [AwsS3Controller],

  providers: [AwsS3Service],
  exports: [AwsS3Service],
})
export class AwsS3Module {}

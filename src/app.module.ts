import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { QueueModule } from './queue/queue.module';
import { EmailWorkerService } from './workers/email-worker.service';
import { EmailModule } from './email/email.module';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
import { AwsS3Module } from './aws-s3/aws-s3.module';
import { AssetsModule } from './assets/assets.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    QueueModule,
    EmailModule,
    RabbitMQModule,
    AwsS3Module,
    AssetsModule,
  ],
  controllers: [],
  providers: [EmailWorkerService],
})
export class AppModule {}

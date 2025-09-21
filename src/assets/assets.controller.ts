import { Controller, Get, Param, Query } from '@nestjs/common';
import { AwsS3Service } from '../aws-s3/aws-s3.service';

@Controller('assets')
export class AssetsController {
  constructor(private readonly awsS3Service: AwsS3Service) {}

  @Get('signed-url')
  async getSignedUrl(
    @Query('key') key: string,
    @Query('expiresIn') expiresIn: string = '3600',
  ) {
    if (!key) {
      throw new Error('Parâmetro "key" é obrigatório');
    }

    this.validateKey(key);

    const signedUrl = await this.awsS3Service.getSignedUrl(
      key,
      parseInt(expiresIn),
    );

    return {
      signedUrl: signedUrl,
      expiresIn: `${expiresIn} segundos`,
      key: key,
    };
  }

  private validateKey(key: string): void {
    const allowedPaths = ['avatars/', 'trips/', 'maps/', 'uploads/'];
    const isValid = allowedPaths.some((path) => key.startsWith(path));

    if (!isValid) {
      throw new Error(
        `Key "${key}" não permitida. Caminhos permitidos: ${allowedPaths.join(', ')}`,
      );
    }
  }
}

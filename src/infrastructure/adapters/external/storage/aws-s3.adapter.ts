import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { FileStorage } from '../../../../domain/ports/file-storage.port';

@Injectable()
export class AwsS3Adapter implements FileStorage {
  private readonly logger = new Logger(AwsS3Adapter.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private configService: ConfigService) {
    const region = this.configService.get('AWS_REGION');
    const accessKeyId = this.configService.get('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get('AWS_SECRET_ACCESS_KEY');
    const bucketName = this.configService.get('AWS_S3_BUCKET_NAME');

    if (!region || !accessKeyId || !secretAccessKey || !bucketName) {
      const missingVars: string[] = [];
      if (!region) missingVars.push('AWS_REGION');
      if (!accessKeyId) missingVars.push('AWS_ACCESS_KEY_ID');
      if (!secretAccessKey) missingVars.push('AWS_SECRET_ACCESS_KEY');
      if (!bucketName) missingVars.push('AWS_S3_BUCKET_NAME');

      throw new Error(
        `Variáveis de ambiente AWS não configuradas: ${missingVars.join(', ')}`,
      );
    }

    this.s3Client = new S3Client({
      region: region,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
    });

    this.bucketName = bucketName;
    this.logger.log(`AwsS3Adapter configurado para bucket: ${this.bucketName}`);
  }

  async uploadFile(
    file: Buffer,
    key: string,
    contentType: string,
  ): Promise<string> {
    try {
      this.logger.log(`Uploading file to S3: ${key}`);

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file,
        ContentType: contentType,
        Metadata: {
          uploadedAt: new Date().toISOString(),
          contentLength: file.length.toString(),
        },
      });

      await this.s3Client.send(command);

      const fileUrl = `https://${this.bucketName}.s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${key}`;

      this.logger.log(`Upload concluído: ${fileUrl}`);
      return fileUrl;
    } catch (error) {
      this.logger.error('Erro no upload para S3:', error);
      throw new Error(`Falha no upload do arquivo: ${error.message}`);
    }
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      this.logger.log(`Gerando signed URL para: ${key}`);

      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });

      this.logger.log(`Signed URL gerada (expira em ${expiresIn}s)`);
      return signedUrl;
    } catch (error) {
      this.logger.error('Erro ao gerar signed URL:', error);
      throw new Error(`Falha ao gerar URL assinada: ${error.message}`);
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      this.logger.log(`Deletando arquivo: ${key}`);

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`Arquivo deletado: ${key}`);
    } catch (error) {
      this.logger.error('Erro ao deletar arquivo:', error);
      throw new Error(`Falha ao deletar arquivo: ${error.message}`);
    }
  }
}

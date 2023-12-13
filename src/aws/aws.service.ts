import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Injectable()
export class AwsService {
  private readonly s3: AWS.S3;

  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_S3_REGION,
    });
  }

  async generatePresignedUrl(): Promise<{
    presignedUrl: string;
    publicUrl: string;
  }> {
    const key = this.generateKey('sophwe/uploads', Date.now().toString());
    const params = this.createS3Params(key);

    const presignedUrl = await this.s3.getSignedUrlPromise('putObject', params);
    const publicUrl = this.generatePublicUrl(key);

    return { presignedUrl, publicUrl };
  }

  async getPresignedUrlForProfileImage(
    id: string,
  ): Promise<{ presignedUrl: string; publicUrl: string }> {
    const key = this.generateKey('sophwe/uploads', `${id}_file`);
    const params = this.createS3Params(key);

    const presignedUrl = await this.s3.getSignedUrlPromise('putObject', params);
    const publicUrl = this.generatePublicUrl(key);

    return { presignedUrl, publicUrl };
  }

  private generateKey(basePath: string, fileName: string): string {
    return `${basePath}/${fileName}`;
  }

  private createS3Params(key: string): AWS.S3.PutObjectRequest {
    return {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      ACL: 'public-read',
    };
  }

  private generatePublicUrl(key: string): string {
    return `https://${process.env.AWS_S3_BUCKET}.s3.ap-south-1.amazonaws.com/${key}`;
  }
}

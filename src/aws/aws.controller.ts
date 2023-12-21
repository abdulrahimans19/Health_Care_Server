import { Controller, Get, Query } from '@nestjs/common';
import { AwsService } from './aws.service';

@Controller('aws')
export class AwsController {
  constructor(private readonly awsService: AwsService) {}

  @Get('generate-presigned-url')
  async generatePresignedUrl(): Promise<{
    presignedUrl: string;
    publicUrl: string;
  }> {
    const { presignedUrl, publicUrl } =
      await this.awsService.generatePresignedUrl();
    return { presignedUrl, publicUrl };
  }

  @Get('profile-image-presigned-url')
  async getProfileImagePresignedUrl(
    @Query('id') id: string,
  ): Promise<{ presignedUrl: string; publicUrl: string }> {
    const { presignedUrl, publicUrl } =
      await this.awsService.getPresignedUrlForProfileImage(id);
    return { presignedUrl, publicUrl };
  }
}

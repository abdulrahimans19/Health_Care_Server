import { Controller, Get, Query } from '@nestjs/common';
import { AwsService } from './aws.service';
import { Public } from 'src/shared/decorators';

@Controller('aws')
export class AwsController {
  constructor(private readonly awsService: AwsService) {}

  
  @Get('presigned-url')
  async getPresignedUrl(): Promise<{
    presignedUrl: string;
    publicUrl: string;
  }> {
    const { presignedUrl, publicUrl } =
      await this.awsService.generatePresignedUrl();
    return { presignedUrl, publicUrl };
  }

  @Public()
  @Get('presigned-url-for-profile-image')
  async getPresignedUrlForProfileImage(
    @Query('id') id: string,
  ): Promise<{ presignedUrl: string; publicUrl: string }> {
    const { presignedUrl, publicUrl } =
      await this.awsService.getPresignedUrlForProfileImage(id);
    return { presignedUrl, publicUrl };
  }
}

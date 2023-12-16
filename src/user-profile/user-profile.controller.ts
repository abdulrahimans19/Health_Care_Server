import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { GetUser } from 'src/shared/decorators';
import {
  CreateProfileDto,
  UpdateProfileDto,
  UpdateProfileImageDto,
} from './dto';
import { JwtPayload } from 'src/auth/strategies';
import { ProfileGuard } from 'src/shared/guards';

@Controller('user-profile')
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @Get('all')
  getAllProfiles(@GetUser() user: JwtPayload) {
    return this.userProfileService.getAllProfiles(user);
  }

  @Get('single/:id')
  getSingleProfile(@Param('id') profileId: string) {
    return this.userProfileService.getSingleProfile(profileId);
  }

  @Post('create')
  createProfile(
    @GetUser() user: JwtPayload,
    @Body() createProfileDto: CreateProfileDto,
  ) {
    return this.userProfileService.createProfile(user, createProfileDto);
  }

  @Put('update')
  @UseGuards(ProfileGuard)
  updateProfile(@Body() updateProfileDto: UpdateProfileDto) {
    return this.userProfileService.updateProfile(updateProfileDto);
  }

  @Put('update-profile-image')
  updateProfileImage(@Body() updateProfileImageDto: UpdateProfileImageDto) {
    return this.userProfileService.updateProfileImage(updateProfileImageDto);
  }
}

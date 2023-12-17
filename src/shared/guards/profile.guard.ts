import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  UserProfile,
  user_profile_schema,
} from 'src/user-profile/schema/user-profile.schema';

@Injectable()
export class ProfileGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectModel(UserProfile.name)
    private readonly userProfileModel: Model<UserProfile>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: any = context.switchToHttp().getRequest();
    const userId = request.user.sub;
    const profileIdFromHeaders = request.headers['profile-id'];

    try {
      const userProfile = await this.userProfileModel
        .findOne({ _id: profileIdFromHeaders })
        .exec();

      if (userProfile && userProfile.user_id.toString() === userId) {
        return true;
      }
    } catch (error) {
      console.error(error);
    }

    return false;
  }
}

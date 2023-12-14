import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserProfile } from './schema/user-profile.schema';
import {
  CreateProfileDto,
  UpdateProfileDto,
  UpdateProfileImageDto,
} from './dto';
import { JwtPayload } from 'jwt-decode';

@Injectable()
export class UserProfileService {
  constructor(
    @InjectModel(UserProfile.name)
    private readonly userProfileModel: Model<UserProfile>,
  ) {}

  async createProfile(user: JwtPayload, dto: CreateProfileDto) {
    const userProfile = new this.userProfileModel({
      user_id: user.sub,
      ...dto,
    });

    await userProfile.save();

    return { message: 'User profile created successfully.' };
  }

  async updateProfile(dto: UpdateProfileDto) {
    const updatedProfile = await this.userProfileModel.findByIdAndUpdate(
      dto.profile_id,
      { $set: { ...dto } },
      { new: true },
    );

    if (!updatedProfile) {
      throw new NotFoundException('User profile not found.');
    }

    return { message: 'User profile updated successfully.' };
  }

  async getAllProfiles(user: JwtPayload) {
    const profiles = await this.userProfileModel.find({ user_id: user.sub });
    return { profiles };
  }

  async getSingleProfile(profileId: string) {
    const profile = await this.userProfileModel.findById(profileId);

    if (!profile) {
      throw new NotFoundException('User profile not found.');
    }

    return { profile };
  }

  async updateProfileImage(dto: UpdateProfileImageDto) {
    const updatedProfile = await this.userProfileModel.findByIdAndUpdate(
      dto.profile_id,
      { $set: { profile_image: dto.image } },
      { new: true },
    );

    if (!updatedProfile) {
      throw new NotFoundException('User profile not found.');
    }

    return { message: 'User profile image updated successfully.' };
  }
}

import { Module } from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { UserProfileController } from './user-profile.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserProfile, user_profile_schema } from './schema/user-profile.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserProfile.name, schema: user_profile_schema },
    ]),
  ],
  providers: [UserProfileService],
  controllers: [UserProfileController],
})
export class UserProfileModule {}

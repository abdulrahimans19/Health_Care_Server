import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserPost, post_schema } from '../post/schema/post.schema';
import { UserPostComments, comments_schema } from './schema/comments.schema';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import {
  UserProfile,
  user_profile_schema,
} from 'src/user-profile/schema/user-profile.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserPost.name, schema: post_schema }]),

    MongooseModule.forFeature([
      { name: UserPostComments.name, schema: comments_schema },
      { name: UserProfile.name, schema: user_profile_schema },
    ]),
  ],
  providers: [CommentsService],
  controllers: [CommentsController],
})
export class CommentsModule {}

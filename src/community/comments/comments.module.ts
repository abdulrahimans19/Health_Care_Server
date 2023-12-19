import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserPost, post_schema } from '../post/schema/post.schema';
import { UserPostComments, comments_schema } from './schema/comments.schema';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserPost.name, schema: post_schema }]),

    MongooseModule.forFeature([
      { name: UserPostComments.name, schema: comments_schema },
    ]),
  ],
  providers: [CommentsService],
  controllers: [CommentsController],
})
export class CommentsModule {}

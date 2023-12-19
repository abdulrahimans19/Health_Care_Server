import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserPost, post_schema } from './schema/post.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserPost.name, schema: post_schema }]),
  ],
  providers: [PostService],
  controllers: [PostController],
})
export class PostModule {}

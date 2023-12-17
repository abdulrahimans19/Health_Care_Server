import {
  HttpException,
  HttpStatus,
  Injectable,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { UserPost } from './schema/post.schema';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(UserPost.name) private readonly postModel: Model<UserPost>,
  ) {}
  async createPost(profile_id, { post }) {
    try {
      console.log(post, profile_id);

      await new this.postModel({
        profile_id: new mongoose.Types.ObjectId(profile_id),
        post: post,
      })
        .save()
        .then((data) => console.log(data))
        .catch((err) => {
          throw new HttpException(err, HttpStatus.BAD_GATEWAY);
        });
      return { message: 'post was created' };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_GATEWAY);
    }
  }

  async deletePost(profile_id: string, { post_id }) {
    try {
      const userPost = await this.postModel
        .findById(new mongoose.Types.ObjectId(post_id))
        .then((data) => {
          return data;
        })
        .catch((err) => {
          throw new HttpException(err, HttpStatus.BAD_GATEWAY);
        });

      console.log(userPost);
      if (userPost.profile_id.toString() != profile_id) {
        throw new UnauthorizedException();
      }
      if (!userPost) {
        throw new HttpException('post was not found', HttpStatus.BAD_GATEWAY);
      } else {
        await this.postModel.findByIdAndDelete(
          new mongoose.Types.ObjectId(post_id),
        );
        return { message: 'post was deleted' };
      }
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_GATEWAY);
    }
  }
}

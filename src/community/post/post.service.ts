import {
  HttpException,
  HttpStatus,
  Injectable,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, ObjectId } from 'mongoose';
import { UserPost } from './schema/post.schema';
import { deletePostDto } from './dto/post.dto';
interface LikeUserPostParams {
  post_id: string;
  profile_id: string;
}
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
        .findOne({
          _id: new mongoose.Types.ObjectId(post_id),
          is_deleted: false,
        })
        .then((data) => {
          return data;
        })
        .catch((err) => {
          throw new HttpException(err, HttpStatus.BAD_GATEWAY);
        });

      console.log(userPost);

      if (!userPost) {
        throw new HttpException('post was not found', HttpStatus.BAD_GATEWAY);
      } else {
        if (userPost?.profile_id.toString() != profile_id) {
          throw new UnauthorizedException();
        }

        await this.postModel.findByIdAndUpdate(
          new mongoose.Types.ObjectId(post_id),
          { is_deleted: true },
        );
        return { message: 'post was deleted' };
      }
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_GATEWAY);
    }
  }

  async getAllUserPost(profile_id: string) {
    try {
      const alluserPost = await this.postModel.find({
        profile_id: new mongoose.Types.ObjectId(profile_id),
        is_deleted: false,
      });
      return alluserPost;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_GATEWAY);
    }
  }

  async likeUserPost(profile_id, { post_id }) {
    try {
      console.log(profile_id, post_id);

      const likedUser = await this.postModel.findOne({
        _id: new mongoose.Types.ObjectId(post_id),
        people_liked: new mongoose.Types.ObjectId(profile_id),
      });
      if (likedUser) {
        throw new HttpException('already Liked', HttpStatus.BAD_GATEWAY);
      }
      console.log(likedUser);

      await this.postModel.findOneAndUpdate(
        {
          _id: post_id,
        },
        {
          $push: { people_liked: new mongoose.Types.ObjectId(profile_id) },
          $inc: { total_liked: 1 },
        },
      );

      return { message: 'post liked' };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_GATEWAY);
    }
  }

  async unlikeUserPost(profile_id, { post_id }) {
    try {
      console.log(profile_id, post_id);

      const likedUser = await this.postModel.findOne({
        _id: new mongoose.Types.ObjectId(post_id),
        people_liked: new mongoose.Types.ObjectId(profile_id),
      });
      if (!likedUser) {
        throw new HttpException(
          'you did not Liked this post',
          HttpStatus.BAD_GATEWAY,
        );
      }
      console.log(likedUser);
      console.log('gioeurg');
      console.log(profile_id, post_id);
      await this.postModel.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(post_id),
        },
        {
          $pull: { people_liked: new mongoose.Types.ObjectId(profile_id) },
          $inc: { total_liked: -1 },
        },
      );

      return { message: 'post unliked' };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_GATEWAY);
    }
  }
}

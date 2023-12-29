import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import mongoose, { Model, Types } from 'mongoose';
import { CommentDto, deleteCommentDto, getCommentDto } from './dto/post.dto';
import { UserPost } from '../post/schema/post.schema';
import { InjectModel } from '@nestjs/mongoose';
import { UserPostComments } from './schema/comments.schema';
import { get } from 'http';
import { profile } from 'console';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(UserPostComments.name)
    private readonly commentModel: Model<UserPostComments>,
    @InjectModel(UserPost.name) private readonly postModel: Model<UserPost>,
  ) {}

  async addComment(dto: CommentDto, profile_id) {
    console.log(dto);
    try {
      const userPost = await this.postModel.findOne({
        _id: new mongoose.Types.ObjectId(dto.post_id),
        is_deleted: false,
      });

      if (!userPost) {
        throw new HttpException('post Does not exist', HttpStatus.BAD_GATEWAY);
      }
      await new this.commentModel({
        post_id: new mongoose.Types.ObjectId(dto.post_id),
        comment: dto.comment,
        profile_id: new mongoose.Types.ObjectId(profile_id),
      }).save();

      await this.postModel.findOneAndUpdate(
        { _id: dto.post_id },
        { $inc: { total_comments: 1 } },
      );

      return { message: 'comment added' };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_GATEWAY);
    }
  }

  async getComments(dto: getCommentDto, profile_id) {
    try {
      const userPost = await this.postModel.findOne({
        _id: new mongoose.Types.ObjectId(dto.post_id),
        is_deleted: false,
      });

      console.log(userPost);

      if (!userPost) {
        throw new HttpException('post not found', HttpStatus.BAD_GATEWAY);
      }
      const startIndex = (dto.page - 1) * 10;
      const pageSize = 10; // Number of items per page

      const findComments = await this.commentModel.aggregate([
        {
          $match: {
            post_id: new mongoose.Types.ObjectId(dto.post_id),
            is_deleted: false,
          },
        },
        {
          $addFields: {
            is_your_comment: {
              $cond: {
                if: {
                  $eq: ['$profile_id', new mongoose.Types.ObjectId(profile_id)],
                },
                then: true,
                else: false,
              },
            },
          },
        },
        {
          $sort: {
            created_at: -1, // Sort by created_at in descending order (newest first)
          },
        },
        {
          $skip: startIndex,
        },
        {
          $limit: pageSize,
        },
        {
          $project: {
            profile_id: 0,
            people_liked: 0,
          },
        },
      ]);

      return findComments;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_GATEWAY);
    }
  }

  async deleteComments(dto: deleteCommentDto, profile_id) {
    try {
      console.log(profile_id, dto.comment_id);
      const userComment = await this.commentModel.findOne({
        _id: new mongoose.Types.ObjectId(dto.comment_id),
        profile_id: new mongoose.Types.ObjectId(profile_id),
        is_deleted: false,
      });
      console.log(userComment);
      if (!userComment) {
        throw new UnauthorizedException('unable to process request');
      }
      await this.commentModel.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(dto.comment_id) },
        { is_deleted: true },
      );
      await this.postModel.findOneAndUpdate(
        { _id: userComment.post_id },
        { $inc: { total_comments: -1 } },
      );

      return { message: 'comment was deleted' };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_GATEWAY);
    }
  }

  async likeComment(profile_id: string, id: string) {
    try {
      // console.log(profile_id,id);
      // const findComment = await this.commentModel.findOne({
      //   _id: new mongoose.Types.ObjectId(id),
      //   is_deleted: false,
      // });
      // console.log(findComment);
      // if (!findComment) {
      //   throw new HttpException(
      //     'comment was not found',
      //     HttpStatus.BAD_GATEWAY,
      //   );
      // }
      // const likedComment = await this.commentModel.findOne({
      //   _id: new mongoose.Types.ObjectId(id),
      //   is_deleted: false,
      //   people_liked: new mongoose.Types.ObjectId(profile_id),
      // });

      // if (likedComment) {
      //   throw new HttpException(
      //     'already liked this post',
      //     HttpStatus.BAD_GATEWAY,
      //   );
      // }
      // await this.commentModel.findOneAndUpdate(
      //   { _id: new mongoose.Types.ObjectId(id), is_deleted: false },
      //   {
      //     $push: { people_liked: new mongoose.Types.ObjectId(profile_id) },
      //     $inc: { total_likes: 1 },
      //   },
      // );

      const comment = await this.commentModel.findOne({
        _id: new mongoose.Types.ObjectId(id),
        is_deleted: false,
      });

      const isLiked = comment.people_liked.get(profile_id);
      let val = '';
      if (isLiked) {
        comment.people_liked.delete(profile_id);
      } else {
        val = 'liked';
        comment.people_liked.set(profile_id, true);
      }

      const updatedComment = await this.commentModel.findByIdAndUpdate(
        { _id: new mongoose.Types.ObjectId(id) },
        {
          $set: { people_liked: comment.people_liked },
          $inc: val === 'liked' ? { total_likes: 1 } : { total_likes: -1 },
        },
        { new: true },
      );
      return { message: 'comment was liked' };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_GATEWAY);
    }
  }

  async unLikeComment(profile_id: string, id: string) {
    try {
      const findComment = await this.commentModel.findOne({
        _id: new mongoose.Types.ObjectId(id),
        is_deleted: false,
      });
      if (!findComment) {
        throw new HttpException(
          'comment was not found',
          HttpStatus.BAD_GATEWAY,
        );
      }
      const likedComment = await this.commentModel.findOne({
        _id: new mongoose.Types.ObjectId(id),
        is_deleted: false,
        people_liked: new mongoose.Types.ObjectId(profile_id),
      });

      if (!likedComment) {
        throw new HttpException(
          'you havent liked the post',
          HttpStatus.BAD_GATEWAY,
        );
      }
      await this.commentModel.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(id), is_deleted: false },
        {
          $pull: { people_liked: new mongoose.Types.ObjectId(profile_id) },
          $inc: { total_likes: -1 },
        },
      );
      return { message: 'comment was un liked' };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_GATEWAY);
    }
  }
}

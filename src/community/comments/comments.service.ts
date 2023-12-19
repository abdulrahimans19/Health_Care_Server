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
          $skip: startIndex,
        },
        {
          $limit: pageSize,
        },
        {
          $project: {
            profile_id: 0,
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
      if (!userComment) {
        throw new UnauthorizedException('unable to process request');
      }
      await this.commentModel.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(dto.comment_id) },
        { is_deleted: true },
      );

      return { message: 'comment was deleted' };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_GATEWAY);
    }
  }
}

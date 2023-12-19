import { IsMongoId, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CommentDto {
  @IsNotEmpty()
  @IsString()
  comment: string;

  @IsNotEmpty()
  @IsMongoId()
  post_id: Types.ObjectId;
}

export class getCommentDto {
  @IsNotEmpty()
  @IsMongoId()
  post_id: Types.ObjectId;

  @IsNotEmpty()
  @IsNumber()
  page: number;
}

export class deleteCommentDto {
  @IsNotEmpty()
  @IsMongoId()
  comment_id: Types.ObjectId;
}

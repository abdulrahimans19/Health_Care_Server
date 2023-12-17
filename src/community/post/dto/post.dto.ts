import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { Document, SchemaTypes, Types } from 'mongoose';

export class CreatePostDto {
  @IsNotEmpty()
  @IsString()
  post: string;
}
export class deletePostDto {
  @IsNotEmpty()
  @IsMongoId()
  post_id: Types.ObjectId;
}

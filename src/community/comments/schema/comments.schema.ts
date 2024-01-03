import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

@Schema()
export class UserPostComments extends Document {

  @Prop({ ref: 'userposts' })
  post_id: Types.ObjectId;

  @Prop({ index: true })
  profile_id: Types.ObjectId;

  @Prop()
  comment: string;

  @Prop({ default: false })
  is_deleted: boolean;

  @Prop({ default: 0 })
  total_likes: number;

  @Prop({ default: new Map<string, boolean>() })
  people_liked: Map<string, boolean>;

  @Prop({ default: Date.now(), index: true })
  created_at: Date;
}

export const comments_schema = SchemaFactory.createForClass(UserPostComments);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

@Schema()
export class UserPost extends Document {
  
  @Prop({ index: true })
  profile_id: Types.ObjectId;

  @Prop({ required: true })
  post: string;

  @Prop({ default: false })
  is_deleted: boolean;

  @Prop({ default: 0 })
  total_liked: number;

  @Prop({ default: new Map<string, boolean>() })
  people_liked: Map<string, boolean>;
  

  @Prop({ default: 0 })
  total_comments: number;

  @Prop({ default: Date.now(), index: true })
  created_at: Date;
}

export const post_schema = SchemaFactory.createForClass(UserPost);

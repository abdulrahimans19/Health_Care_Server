import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
}

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class UserProfile extends Document {
  @Prop({ type: SchemaTypes.ObjectId, index: true })
  user_id: Types.ObjectId;

  @Prop()
  first_name: string;

  @Prop({ default: null })
  middle_name: string;

  @Prop()
  last_name: string;

  @Prop()
  gender: Gender;

  @Prop()
  date_of_birth: Date;

  @Prop()
  phone_number: string;

  @Prop()
  height: number;

  @Prop()
  weight: number;

  @Prop({ default: null })
  profile_image: string;
}

export const user_profile_schema = SchemaFactory.createForClass(UserProfile);

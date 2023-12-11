import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum UserRoles {
  ADMIN = 'Admin',
  USER = 'User',
}

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class User extends Document {
  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ type: String })
  password: string;

  @Prop({ type: String })
  fcm_token: string;

  @Prop()
  otp: string;

  @Prop({ type: String, default: UserRoles.USER })
  roles: string;

  @Prop({ required: true, default: false })
  is_active: boolean;

  @Prop({ required: true, default: false })
  is_deleted: boolean;
}

export const user_schema = SchemaFactory.createForClass(User);

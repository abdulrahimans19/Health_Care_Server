import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { UserProfile } from 'src/user-profile/schema/user-profile.schema';

export enum Goal {
  Weight_loss = 'Weight loss',
  gain_muscle = 'Gain muscle',
  yoga = 'Yoga',
}

@Schema()
export class FitnessUser extends Document {
  @Prop({ index: true, ref: UserProfile.name })
  profile_id: Types.ObjectId;

  @Prop({ required: true })
  goal_weight: number;

  @Prop({ required: true })
  goal: Goal;

  @Prop({ default: false })
  is_deleted: boolean;

  @Prop({ default: Date.now() })
  created_at: Date;
}

export const fitnessUser_schema = SchemaFactory.createForClass(FitnessUser);

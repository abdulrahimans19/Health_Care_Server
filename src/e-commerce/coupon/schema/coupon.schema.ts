import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { SubCategories } from 'src/e-commerce/sub-categories/schema/sub-categories.schema';
import { User } from 'src/user/schema/user.schema';

@Schema()
export class Coupon extends Document {
  @Prop({ required: true, index: true })
  code: string;

  @Prop({ required: true })
  discount_percentage: number;

  @Prop()
  min_amount: number;

  @Prop({ type: SchemaTypes.ObjectId, ref: User.name })
  user_id: Types.ObjectId[];

  @Prop({ default: true })
  is_active: boolean;

  @Prop({ default: null })
  expiry_date: Date;

  @Prop({ default: Date.now(), index: true })
  created_at: Date;

  @Prop({ default: Date.now(), index: true })
  updated_at: Date;
}

export const coupon_schema = SchemaFactory.createForClass(Coupon);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { Product } from 'src/e-commerce/product/schema/product.schema';
import { UserProfile } from 'src/user-profile/schema/user-profile.schema';

@Schema()
export class Review extends Document {
  @Prop({ type: SchemaTypes.ObjectId, ref: Product.name })
  product_id: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: UserProfile.name })
  profile_id: Types.ObjectId;

  @Prop()
  rating: number;

  @Prop()
  comment: string;

  @Prop({ default: Date.now() })
  created_at: Date;

  @Prop({ default: Date.now() })
  updated_at: Date;
}

export const review_schema = SchemaFactory.createForClass(Review);

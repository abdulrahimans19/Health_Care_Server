import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { Product } from 'src/e-commerce/product/schema/product.schema';
import { UserProfile } from 'src/user-profile/schema/user-profile.schema';

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Favourites extends Document {
  @Prop({ type: SchemaTypes.ObjectId, ref: UserProfile.name })
  profile_id: Types.ObjectId;

  @Prop({ type: [{ type: SchemaTypes.ObjectId, ref: Product.name }] })
  pharma_products: Types.ObjectId[];

  @Prop({ type: [{ type: SchemaTypes.ObjectId, ref: Product.name }] })
  food_products: Types.ObjectId[];
}

export const favourites_schema = SchemaFactory.createForClass(Favourites);

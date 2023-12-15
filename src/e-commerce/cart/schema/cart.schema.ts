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
export class CartItem {
  @Prop({ type: SchemaTypes.ObjectId, ref: Product.name })
  product: Types.ObjectId;

  @Prop({ required: true, default: 1 })
  quantity: number;
}

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Cart extends Document {
  @Prop({ type: SchemaTypes.ObjectId, ref: UserProfile.name })
  profile_id: Types.ObjectId;

  @Prop({ type: [CartItem], default: [] })
  pharma_products: CartItem[];

  @Prop({ type: [CartItem], default: [] })
  food_products: CartItem[];
}

export const cart_schema = SchemaFactory.createForClass(Cart);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { Address } from 'src/e-commerce/address/schema/address.schema';
import { Product } from 'src/e-commerce/product/schema/product.schema';
import { Review } from 'src/e-commerce/review/schema/review.schema';
import { product_types } from 'src/e-commerce/types';
import { UserProfile } from 'src/user-profile/schema/user-profile.schema';

export enum OrderStatus {
  PENDING = 'Pending',
  CREATED = 'Created',
  SHIPPED = 'Shipped',
  OUT_FOR_DELIVERY = 'Out for Delivery',
  DELIVERED = 'Delivered',
}

@Schema()
export class Order extends Document {
  @Prop({
    type: SchemaTypes.ObjectId,
    ref: UserProfile.name,
    required: true,
    index: true,
  })
  profile_id: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: Product.name, required: true })
  product_id: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: Address.name, required: true })
  address_id: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: Review.name, default: null })
  review_id: Types.ObjectId;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  total_amount: number;

  @Prop({ required: true })
  real_total_amount: number;

  @Prop({ required: true })
  discounted_amount: number;

  @Prop({ enum: OrderStatus, default: OrderStatus.CREATED })
  order_status: OrderStatus;

  @Prop({ default: 1 })
  status: number;

  @Prop()
  shipped_at: Date;

  @Prop()
  delivered_at: Date;

  @Prop()
  cancelled_at: Date;

  @Prop()
  refund_amount: number;

  @Prop()
  delivery_fee: number;

  @Prop({ type: String, required: true })
  product_type: product_types;

  @Prop({ default: Date.now(), index: true })
  created_at: Date;
}

export const order_schema = SchemaFactory.createForClass(Order);

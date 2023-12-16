import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { Address } from 'src/e-commerce/address/schema/address.schema';
import { Coupon } from 'src/e-commerce/coupon/schema/coupon.schema';
import { Product } from 'src/e-commerce/product/schema/product.schema';
import { product_types } from 'src/e-commerce/types';
import { UserProfile } from 'src/user-profile/schema/user-profile.schema';

export enum OrderStatus {
  CREATED = 'Created',
  SHIPPED = 'Shipped',
  OUT_FOR_DELIVERY = 'Out for Delivery',
  DELIVERED = 'Delivered',
}

@Schema()
export class Order extends Document {
  @Prop({ type: SchemaTypes.ObjectId, ref: UserProfile.name, required: true })
  profile_id: Types.ObjectId;

  @Prop({
    type: [
      {
        product: { type: SchemaTypes.ObjectId, ref: Product.name },
        quantity: { type: Number },
        price: { type: Number },
      },
    ],
    required: true,
  })
  products: {
    product: Types.ObjectId;
    quantity: number;
    price: number;
  }[];

  @Prop({ required: true })
  total_amount: number;

  @Prop({ type: SchemaTypes.ObjectId, ref: Address.name })
  address_id: Types.ObjectId;

  @Prop({ enum: OrderStatus, default: OrderStatus.CREATED })
  order_status: OrderStatus;

  @Prop({ type: SchemaTypes.ObjectId, ref: Coupon.name })
  coupon_id: Types.ObjectId;

  @Prop({ default: 1 })
  status: number;

  @Prop({ default: null })
  shipped_at: Date;

  @Prop({ default: null })
  delivered_at: Date;

  @Prop({ default: null })
  cancelled_at: Date;

  @Prop({ default: null })
  payment_transaction_id: string;

  @Prop({ default: null })
  refund_amount: number;

  @Prop({ default: null })
  delivery_fee: number;

  @Prop({
    type: [
      {
        product: SchemaTypes.ObjectId,
        quantity: Number,
        refunded_amount: Number,
      },
    ],
    default: [],
  })
  refunded_products: {
    product: Types.ObjectId;
    quantity: number;
    refunded_amount: number;
  }[];

  @Prop({ type: String })
  product_type: product_types;

  @Prop({ default: Date.now(), index: true })
  created_at: Date;
}

export const order_schema = SchemaFactory.createForClass(Order);

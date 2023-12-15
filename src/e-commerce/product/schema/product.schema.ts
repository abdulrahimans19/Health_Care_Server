import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { SubCategories } from 'src/e-commerce/sub-categories/schema/sub-categories.schema';

@Schema()
export class Product extends Document {
  @Prop({ index: true })
  name: string;

  @Prop()
  description: string;

  @Prop()
  image: string;

  @Prop()
  brand: string;

  @Prop({ index: true })
  price: number;

  @Prop({ default: 0 })
  offer_price: number;

  @Prop()
  product_type: string;

  @Prop({ default: 0 })
  quantity: number;

  @Prop()
  product_sold: number;

  @Prop({ type: SchemaTypes.ObjectId, ref: SubCategories.name })
  sub_category_id: Types.ObjectId;

  @Prop({ type: [{ type: SchemaTypes.ObjectId, ref: 'Review' }], default: [] })
  reviews: Types.ObjectId[];

  @Prop({ default: 0 })
  averageRating: number;

  @Prop({ default: false })
  is_deleted: boolean;

  @Prop({ default: Date.now(), index: true })
  created_at: Date;

  @Prop({ default: Date.now(), index: true })
  updated_at: Date;
}

export const product_schema = SchemaFactory.createForClass(Product);

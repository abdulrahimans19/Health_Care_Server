import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class MainCategories extends Document {
  @Prop()
  title: string;

  @Prop()
  image: string;

  @Prop()
  product_type: string;

  @Prop({ type: [{ type: SchemaTypes.ObjectId, ref: 'SubCategories' }] })
  sub_categories: Types.ObjectId[];
}

export const main_category_schema =
  SchemaFactory.createForClass(MainCategories);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { MainCategories } from 'src/e-commerce/main-categories/schema/main-categories.schema';

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class SubCategories extends Document {
  @Prop()
  title: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: MainCategories.name })
  main_category_id: Types.ObjectId;
}

export const sub_category_schema = SchemaFactory.createForClass(SubCategories);

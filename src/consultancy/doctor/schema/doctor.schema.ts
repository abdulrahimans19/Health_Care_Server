import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, SchemaTypes } from 'mongoose';
import { MainCategories } from 'src/e-commerce/main-categories/schema/main-categories.schema';

export enum Gender {
  Male = 'male',
  Female = 'female',
}

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Doctor {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop()
  gender: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: MainCategories.name, index: true })
  category_id: Types.ObjectId;

  @Prop()
  about: string;

  @Prop()
  featured: boolean;

  @Prop({ default: 0 })
  likes: number;

  @Prop()
  image: string;

  @Prop()
  experience: number;
}

export const doctor_schema = SchemaFactory.createForClass(Doctor);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { double } from 'aws-sdk/clients/lightsail';
import mongoose, { Types, SchemaTypes } from 'mongoose';
import { MainCategories } from 'src/e-commerce/main-categories/schema/main-categories.schema';

// interface AvailabilitySlot {
//   start_time: string;
//   end_time: string;
// }

// interface Availability {
//   day: number;
//   slots: Types.ObjectId[];
// }

export enum Gender {
  Male = 'male',
  Female = 'female'
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

  @Prop()
  image: string;

  @Prop()
  experience: number;

  @Prop({
    type: [{ type: SchemaTypes.ObjectId, ref: 'Slots' }],
  })
  availability: [];

  @Prop()
  next_available_slot: string;

  @Prop({
    type: [
      {
        user_profile: { type: Types.ObjectId },
        rating: { type: Number, default: 0 },
      },
    ],
    default: () => [{ user_profile: new Types.ObjectId(), rating: 0 }],
  })
  ratings: { user_profile: Types.ObjectId; rating: number }[];

  @Prop({ type: Number, default: 0 })
  average_rating: number;
}

export const doctor_schema = SchemaFactory.createForClass(Doctor);
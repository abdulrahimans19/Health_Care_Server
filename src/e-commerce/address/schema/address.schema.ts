import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

@Schema()
export class Address extends Document {
  @Prop({ schema: SchemaTypes.ObjectId })
  profile_id: Types.ObjectId;

  @Prop()
  full_name: string;

  @Prop()
  phone_number: string;

  @Prop()
  state: string;

  @Prop()
  city: string;

  @Prop()
  street_address: string;

  @Prop()
  zip_code: string;
}

export const address_schema = SchemaFactory.createForClass(Address);

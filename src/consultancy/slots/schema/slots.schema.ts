import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types, SchemaTypes } from 'mongoose';

@Schema({})
export class Slots {
  @Prop()
  start_time: string;

  @Prop()
  end_time: string;
}

export const slot_schema = SchemaFactory.createForClass(Slots);

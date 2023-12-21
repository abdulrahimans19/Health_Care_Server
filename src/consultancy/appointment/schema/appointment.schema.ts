import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, SchemaTypes } from 'mongoose';

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Appointment {
  @Prop()
  doctorId: string;

  @Prop()
  patientId: string;

  @Prop()
  date: string;

  @Prop()
  time: string;
}

export const doctor_schema = SchemaFactory.createForClass(Appointment);

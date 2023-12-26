import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, SchemaTypes } from 'mongoose';
import { Slots } from 'src/consultancy/slots/schema/slots.schema';
import { User } from 'src/user/schema/user.schema';

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Appointment {
  @Prop({ type: SchemaTypes.ObjectId, ref: User.name, index: true, required: true })
  doctorId: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: User.name, index: true, required: true })
  patientId: Types.ObjectId;

  @Prop({
    default: () => new Date().toLocaleDateString(), // Set the default value to the current date
  })
  date: string;

  @Prop()
  time: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: Slots.name, index: true, required: true })
  slotId: Types.ObjectId;
}

export const appointment_schema = SchemaFactory.createForClass(Appointment);

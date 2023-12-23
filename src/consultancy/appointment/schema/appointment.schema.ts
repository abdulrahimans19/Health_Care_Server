import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, SchemaTypes } from 'mongoose';
import { User } from 'src/user/schema/user.schema';

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Appointment {
  @Prop({ type: SchemaTypes.ObjectId, ref: User.name, index: true })
  doctorId: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: User.name, index: true })
  patientId: Types.ObjectId;

  @Prop()
  date: string;

  @Prop()
  time: string;
}

export const doctor_schema = SchemaFactory.createForClass(Appointment);

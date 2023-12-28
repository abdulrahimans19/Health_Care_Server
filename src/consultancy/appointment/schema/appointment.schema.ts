import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, SchemaTypes } from 'mongoose';
import { Doctor } from 'src/consultancy/doctor/schema/doctor.schema';
import { Slots } from 'src/consultancy/slots/schema/slots.schema';
import { UserProfile } from 'src/user-profile/schema/user-profile.schema';
import { User } from 'src/user/schema/user.schema';

enum Status{
  UPCOMING="upcoming",
  COMPLETED="completed"
}

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Appointment {
  @Prop({ type: SchemaTypes.ObjectId, ref: Doctor.name, index: true, required: true })
  doctorId: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: UserProfile.name, index: true, required: true })
  patientId: Types.ObjectId;

  @Prop({
    default: () => new Date().toLocaleDateString(), // Set the default value to the current date
  })
  date: string;

  @Prop()
  time: string;

  @Prop()
  description: string;

  @Prop()
  image: string;

  @Prop({ default: false })
  isCompleted: boolean;

  @Prop({ type: SchemaTypes.ObjectId, ref: Slots.name, index: true, required: true })
  slotId: Types.ObjectId;

  @Prop({ enum: Status, default: Status.UPCOMING })
  status: Status;
}

export const appointment_schema = SchemaFactory.createForClass(Appointment);

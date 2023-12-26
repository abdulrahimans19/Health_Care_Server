import { Module } from '@nestjs/common';
import { DoctorController } from './doctor.controller';
import { DoctorService } from './doctor.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Doctor, doctor_schema } from './schema/doctor.schema';
import { UserModule } from 'src/user/user.module';
import { Slots, slot_schema } from '../slots/schema/slots.schema';
import { Appointment, appointment_schema } from '../appointment/schema/appointment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Doctor.name, schema: doctor_schema },
      { name: Slots.name, schema: slot_schema },
      { name: Appointment.name, schema: appointment_schema }
    ]),
    UserModule
  ],
  controllers: [DoctorController],
  providers: [DoctorService]
})
export class DoctorModule { }

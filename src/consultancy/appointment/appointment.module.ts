import { Module } from '@nestjs/common';
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Appointment, doctor_schema } from './schema/appointment.schema';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Appointment.name, schema: doctor_schema }]),
    UserModule
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService]
})
export class DoctorModule {}

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
// import { DoctorDto } from './dto/appointment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Appointment } from './schema/appointment.schema';
import mongoose, { Model } from 'mongoose';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectModel(Appointment.name) private readonly appointmentModel: Model<Appointment>,
  ) { }

  async addAppointment(dto: any) {
    try {
      await this.appointmentModel.create(dto);
      return { message: 'Appointment created.' };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async getUserAppointment({ user_id, status,profile_id }: any) {
    try {
      const appointments = await this.appointmentModel.find({
        patientId: new mongoose.Types.ObjectId(profile_id),
        status
      }).populate([
        {
          path: 'slotId',
          select: 'start_time end_time' // Specify the fields you want to populate
        },
        {
          path: 'doctorId',
          select: '-_id -availability' 
        }
      ]);
      return appointments
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async getDoctorAppointment(doctorId: any) {
    try {
      const appointments = await this.appointmentModel.find(doctorId).populate("slotId");
      return appointments
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}

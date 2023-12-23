import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
// import { DoctorDto } from './dto/appointment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Appointment } from './schema/appointment.schema';
import mongoose, { Model } from 'mongoose';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectModel(Appointment.name) private readonly doctorModel: Model<Appointment>,
  ) {}
  
  
}

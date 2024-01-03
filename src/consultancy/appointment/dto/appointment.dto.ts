import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';

export class AppointmentDto {

  @IsMongoId()
  @IsNotEmpty()
  slotId: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsMongoId()
  @IsNotEmpty()
  doctorId: Types.ObjectId;

  @IsMongoId()
  @IsNotEmpty()
  patientId: Types.ObjectId;
}


export type AppointmentStatus = 'upcoming' | 'completed';
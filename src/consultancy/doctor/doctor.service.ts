import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DoctorDto } from './dto/doctor.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Doctor, Gender } from './schema/doctor.schema';
import mongoose, { Model } from 'mongoose';

@Injectable()
export class DoctorService {
  constructor(
    @InjectModel(Doctor.name) private readonly doctorModel: Model<Doctor>,
  ) {}
  async addDoctor(dto: DoctorDto) {
    try {
      await this.doctorModel.create(dto);
      return { message: 'Doctor created.' };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async getDoctor(
    experience?: number,
    categoryId?: string,
    gender?: Gender,
    page?: number,
    pageSize?: number,
  ) {
    try {
      const query: any = {};

      if (gender) {
        query.gender = gender;
      }

      if (categoryId) {
        query.category_id = new mongoose.Types.ObjectId(categoryId);
      }

      if (experience) {
        query.experience = { $lte: experience };
      }

      const skip = (page - 1) * pageSize;

      const doctors = await this.doctorModel
        .find(query)
        .skip(skip)
        .limit(pageSize)
        .exec();

      return { doctors };
    } catch (error) {
      console.log(error);
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async getDoctorBySearch(search: string) {
    try {
      console.log(search);
      const searchQuery = {
        $or: [
          {
            name: { $regex: search, $options: 'i' },
          },
        ],
      };
      const getDoctorSearch = await this.doctorModel.find(searchQuery);
      return { getDoctorSearch };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async getDoctorDetails(doctorId: string) {
    try {
      const getDoctorById = await this.doctorModel.findById({
        _id: new mongoose.Types.ObjectId(doctorId),
      });
      if (!getDoctorById) {
        return { message: 'Doctor not found' };
      }
      return { getDoctorById };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}

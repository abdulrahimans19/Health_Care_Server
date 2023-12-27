import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DoctorDto, RateDto } from './dto/doctor.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Doctor, Gender } from './schema/doctor.schema';
import mongoose, { Model } from 'mongoose';
import { Appointment } from '../appointment/schema/appointment.schema';

type AggregationResult = {
  _id: mongoose.Types.ObjectId;
  doctors: Array<Doctor & { id: string }>;
};

@Injectable()
export class DoctorService {
  constructor(
    @InjectModel(Doctor.name) private readonly doctorModel: Model<Doctor>,
    @InjectModel(Appointment.name)
    private readonly appointmentModel: Model<Appointment>,
  ) {}
  async addDoctor(dto: any) {
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
        .populate('availability')
        .skip(skip)
        .limit(pageSize)
        .exec();

      const today = new Date();
      const formattedToday = `${
        today.getMonth() + 1
      }/${today.getDate()}/${today.getFullYear()}`;

      let data = doctors.map(async (doctor: any) => {
        let next_available_slot = '';
        if (doctor.availability.length) {
          const appointment = doctor.availability.map(async (slot: any) => {
            const slotPresent = await this.appointmentModel.findOne({
              date: formattedToday,
              doctorId: doctor._id,
              slotId: (slot as any)._id,
            });
            if (!next_available_slot && !slotPresent)
              next_available_slot = (slot as any).start_time;
            return {
              _id: (slot as any)._id,
              start_time: (slot as any).start_time,
              end_time: (slot as any).end_time,
              isBooked: slotPresent ? true : false,
            };
          });
          const availability = await Promise.all(appointment);
          return {
            ...doctor._doc,
            next_available_slot,
            availability,
          };
        }
      });
      data = await Promise.all(data);
      return data;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async getDoctorBySearch(search: string, categoryId: string) {
    try {
      const searchQuery = {
        category_id: new mongoose.Types.ObjectId(categoryId),
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

  async getDoctorDetails(doctorId: string, dto: any) {
    try {
      const getDoctorById: any = await this.doctorModel.findById({
        _id: new mongoose.Types.ObjectId(doctorId),
      }).populate('availability');
     
      if (getDoctorById.availability.length) {
        let next_available_slot = '';
        const appointment = getDoctorById.availability.map(
          async (slot: any) => {
            const slotPresent = await this.appointmentModel.findOne({
              date: dto.date,
              doctorId: getDoctorById._id,
              slotId: (slot as any)._id,
            });
            if (!next_available_slot && !slotPresent)
              next_available_slot = (slot as any).start_time;
            return {
              _id: (slot as any)._id,
              start_time: (slot as any).start_time,
              end_time: (slot as any).end_time,
              isBooked: slotPresent ? true : false,
            };
          },
        );
        const availability = await Promise.all(appointment);
        return {
          ...getDoctorById._doc,
          next_available_slot,
          availability,
        };
      }

      return { getDoctorById };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async getDoctorByCategory(
    categoryId: string,
    page: number,
    pageSize: number,
  ) {
    try {
      const skip = (page - 1) * pageSize;
      const doctorsByCategory = await this.doctorModel
        .find({
          category_id: new mongoose.Types.ObjectId(categoryId),
        })
        .skip(skip)
        .limit(pageSize)
        .exec();
      const today = new Date();
      const formattedToday = `${
        today.getMonth() + 1
      }/${today.getDate()}/${today.getFullYear()}`;

      let data = doctorsByCategory.map(async (doctor: any) => {
        let next_available_slot = '';
        if (doctor.availability.length) {
          const appointment = doctor.availability.map(async (slot: any) => {
            const slotPresent = await this.appointmentModel.findOne({
              date: formattedToday,
              doctorId: doctor._id,
              slotId: (slot as any)._id,
            });
            if (!next_available_slot && !slotPresent)
              next_available_slot = (slot as any).start_time;
            return {
              _id: (slot as any)._id,
              start_time: (slot as any).start_time,
              end_time: (slot as any).end_time,
              isBooked: slotPresent ? true : false,
            };
          });
          const availability = await Promise.all(appointment);
          console.log();
          return {
            ...doctor._doc,
            next_available_slot,
            availability,
          };
        }
      });
      data = await Promise.all(data);
      return data;
      // return { doctorByCategory };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async addDoctorRating(
    rateDto: RateDto,
    doctor_id: string,
    profileId: string,
  ) {
    try {
      const getDoctor = await this.doctorModel.findById({
        _id: new mongoose.Types.ObjectId(doctor_id),
      });

      if (!getDoctor) {
        throw new NotFoundException('Doctor not found');
      }

      const existngRating = getDoctor.ratings.find((r) =>
        r.user_profile.equals(new mongoose.Types.ObjectId(profileId)),
      );

      if (existngRating) {
        throw new ConflictException('User has already rated this doctor');
      }

      getDoctor.ratings.push({
        user_profile: new mongoose.Types.ObjectId(profileId),
        rating: rateDto.rating,
      });
      const totalRating = getDoctor.ratings.reduce(
        (sum, rating) => sum + rating.rating,
        0,
      );
      const actualRatingCount = getDoctor.ratings.length - 1;
      getDoctor.average_rating =
        actualRatingCount > 0
          ? parseFloat((totalRating / actualRatingCount).toFixed(0))
          : 0;

      await getDoctor.save();

      return { message: 'Your rate of experience submitted' };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async getTopDoctors() {
    try {
      const topRatedDoctorsByCategory = await this.doctorModel.aggregate([
        {
          $sort: {
            category_id: 1,
            average_rating: -1,
          },
        },
        {
          $group: {
            _id: '$category_id',
            doctors: { $push: '$$ROOT' },
          },
        },
        {
          $project: {
            category_id: '$_id',
            doctors: {
              $slice: ['$doctors', 2], // Limit to the top 2 doctors for each category
            },
          },
        },
        {
          $unwind: '$doctors',
        },
        {
          $replaceRoot: { newRoot: '$doctors' },
        },
        {
          $sort: {
            category_id: 1,
            average_rating: -1,
          },
        },
      ]);
      const today = new Date();
      const formattedToday = `${
        today.getMonth() + 1
      }/${today.getDate()}/${today.getFullYear()}`;

      let data = topRatedDoctorsByCategory.map(async (doctor: any) => {
        let next_available_slot = '';
        if (doctor.availability?.length) {
          const appointment = doctor.availability.map(async (slot: any) => {
            const slotPresent = await this.appointmentModel.findOne({
              date: formattedToday,
              doctorId: doctor._id,
              slotId: (slot as any)._id,
            });
            console.log(slotPresent);
            if (!next_available_slot && !slotPresent)
              next_available_slot = (slot as any).start_time;
            return {
              _id: (slot as any)._id,
              start_time: (slot as any).start_time,
              end_time: (slot as any).end_time,
              isBooked: slotPresent ? true : false,
            };
          });
          const availability = await Promise.all(appointment);
          return {
            ...doctor._doc,
            next_available_slot,
            availability,
          };
        }
      });

      return { data };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async addDoctorSlots(doctorId: string, dto: any) {
    try {
      let doctor = await this.doctorModel.findById(doctorId);
      console.log('doctor', doctor);
      let upddoctor = await this.doctorModel.findByIdAndUpdate(doctorId, {
        $push: { availability: dto.slotId },
      });
      return { message: 'Doctor slots updated.' };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}

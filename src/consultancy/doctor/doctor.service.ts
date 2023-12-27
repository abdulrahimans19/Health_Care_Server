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

type AggregationResult = {
  _id: mongoose.Types.ObjectId;
  doctors: Array<Doctor & { id: string }>;
};

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

  async getDoctorDetails(doctorId: string) {
    try {
      const getDoctorById = await this.doctorModel.findById({
        _id: new mongoose.Types.ObjectId(doctorId),
      });
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
      const doctorByCategory = await this.doctorModel
        .find({
          category_id: new mongoose.Types.ObjectId(categoryId),
        })
        .skip(skip)
        .limit(pageSize)
        .exec();
      return { doctorByCategory };
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

      return { topRatedDoctorsByCategory };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}

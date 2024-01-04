import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { DoctorDto, RateDto } from './dto/doctor.dto';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Doctor, Gender } from './schema/doctor.schema';
import mongoose, { Model } from 'mongoose';
import { SignInDto, SignUpDto } from 'src/auth/dto';
import { DoctorUpdateDto } from './dto/doctor-update.dto';
import { JwtPayload } from 'src/auth/strategies';
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

  async signUp(signUpDto: SignUpDto): Promise<Doctor> {
    const hashedPassword = await bcrypt.hash(signUpDto.password, 10);
    const existingDoctor = await this.doctorModel.findOne({
      email: signUpDto.email,
    });

    if (existingDoctor) {
      throw new ConflictException('Email is already in use');
    } else {
      const newDoctor = await this.doctorModel.create({
        email: signUpDto.email,
        password: hashedPassword,
      });

      return newDoctor;
    }
  }

  async signIn(signInDto: SignInDto): Promise<Doctor> {
    const { email, password } = signInDto;

    const doctor = await this.doctorModel.findOne({ email });

    if (!doctor) {
      throw new UnauthorizedException('Doctor not found');
    }
    const isPasswordValid = await bcrypt.compare(password, doctor.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    return doctor;
  }

  async getDoctor(
    // experience?: number,
    categoryId?: string,
    gender?: Gender,
    page?: number,
    pageSize?: number,
    today: boolean = false,
    anytime: boolean = false,
    tomorrow: boolean = false,
    exp_start: number = 0,
    exp_end: number = 100,
  ) {
    try {
      const query: any = {};

      if (gender) {
        query.gender = gender;
      }

      if (categoryId) {
        query.category_id = new mongoose.Types.ObjectId(categoryId);
      }
      if (exp_start && exp_end) {
        // Both values are specified, include the range condition
        query.experience = { $gte: exp_start, $lte: exp_end };
      }

      const skip = (page - 1) * pageSize;

      console.log('query', query);

      const doctors = await this.doctorModel
        .find(query)
        .populate('availability')
        .skip(skip)
        .limit(pageSize)
        .exec();

      const today = new Date();
      if (tomorrow) {
        today.setDate(today.getDate() + 1);
      }
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
      const today = new Date();
      const formattedToday = `${
        today.getMonth() + 1
      }/${today.getDate()}/${today.getFullYear()}`;
      const getDoctorSearch = await this.doctorModel
        .find(searchQuery)
        .populate('availability');
      console.log('getDoctorSearch', getDoctorSearch);
      let data = getDoctorSearch.map(async (doctor: any) => {
        let next_available_slot = '';
        if (doctor.availability.length) {
          console.log('availablity inside');
          const appointment = doctor.availability.map(async (slot: any) => {
            const slotPresent = await this.appointmentModel.findOne({
              date: formattedToday,
              doctorId: doctor._id,
              slotId: (slot as any)._id,
            });
            console.log('slot', slot);
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

  async getDoctorDetails(doctorId: string, dto: any) {
    try {
      const getDoctorById: any = await this.doctorModel
        .findById({
          _id: new mongoose.Types.ObjectId(doctorId),
        })
        .populate('availability');

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
      console.log('doctorsByCategory', doctorsByCategory);
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
        {
          $lookup: {
            from: 'slots', // Assuming the collection name is 'slots'
            localField: 'availability',
            foreignField: '_id',
            as: 'availability',
          },
        },
      ]);
      const today = new Date();
      const formattedToday = `${
        today.getMonth() + 1
      }/${today.getDate()}/${today.getFullYear()}`;

      let data = topRatedDoctorsByCategory.map(async (doctor: any) => {
        let next_available_slot = '';
        if (doctor.availability.length) {
          const appointment = doctor.availability.map(
            async (slot: any, index: any) => {
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
            },
          );
          const availability = await Promise.all(appointment);
          return {
            ...doctor,
            next_available_slot,
            availability,
          };
        }
      });
      data = await Promise.all(data);

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
  async updateDoctor(user: JwtPayload, doctorData: DoctorUpdateDto) {
    const { name, description, category_id, about, image, experience, gender } =
      doctorData;

    const updatedDoctor = await this.doctorModel.findOneAndUpdate(
      { _id: user.sub },
      {
        $set: {
          name,
          description,
          category_id,
          about,
          ...(image && { image }),
          experience,
          gender,
        },
      },
      { new: true }, // Return the updated document
    );

    if (!updatedDoctor) {
      throw new Error(`Something went wrong!`);
    }

    return updatedDoctor;
  }

  async doctorSearch(
    search: string,
    categoryId: string,
    page?: number,
    pageSize?: number,
  ) {
    try {
      const skip = (page - 1) * pageSize;
      const searchQuery = {
        category_id: new mongoose.Types.ObjectId(categoryId),
        $or: [
          {
            name: { $regex: search, $options: 'i' },
          },
        ],
      };
      const getDoctorSearch = await this.doctorModel
        .find(searchQuery)
        .populate('availability')
        .skip(skip)
        .limit(pageSize)
        .exec();
      const totalCount = getDoctorSearch.length;
      return {
        getDoctorSearch,
        pagination: {
          page: Math.ceil(page / pageSize) + 1,
          perPage: pageSize,
          totalCounts: totalCount,
          totalPages: Math.ceil(totalCount / pageSize),
        },
      };
    } catch (error) {
      throw new Error(`Something went wrong!`);
    }
  }

  async getTopDoctorsForAdmin(page: number, pageSize: number) {
    try {
      const skip = (page - 1) * pageSize;

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
        {
          $lookup: {
            from: 'slots', // Assuming the collection name is 'slots'
            localField: 'availability',
            foreignField: '_id',
            as: 'availability',
          },
        },
        {
          $skip: skip,
        },
        {
          $limit: pageSize,
        },
      ]);

      // Additional logic for formatting and calculating total count
      const today = new Date();
      const formattedToday = `${
        today.getMonth() + 1
      }/${today.getDate()}/${today.getFullYear()}`;

      const data = [];
      for (const doctor of topRatedDoctorsByCategory) {
        let next_available_slot = '';
        if (doctor.availability.length) {
          const availability = [];
          for (const slot of doctor.availability) {
            const slotPresent = await this.appointmentModel.findOne({
              date: formattedToday,
              doctorId: doctor._id,
              slotId: slot._id,
            });
            if (!next_available_slot && !slotPresent)
              next_available_slot = slot.start_time;

            availability.push({
              _id: slot._id,
              start_time: slot.start_time,
              end_time: slot.end_time,
              isBooked: slotPresent ? true : false,
            });
          }
          data.push({
            ...doctor,
            next_available_slot,
            availability,
          });
        }
      }

      // Calculate total count
      const totalCount = topRatedDoctorsByCategory.length;

      return {
        data,
        pagination: {
          page: Math.ceil(page / pageSize) + 1,
          perPage: pageSize,
          totalCounts: totalCount,
          totalPages: Math.ceil(totalCount / pageSize),
        },
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async getTotalDoctors(
    search: string,
    gender: string,
    category_id: string,
    sortBy: string,
    sortOrder: string,
    page: number,
    pageSize: number,
  ) {
    try {
      const parsedSortOrder = sortOrder ? parseInt(sortOrder, 10) : undefined;
      const matchCriteria = {};
      if (search) {
        matchCriteria['$or'] = [
          { email: new RegExp(search, 'i') },
          { name: new RegExp(search, 'i') },
        ];
      }

      if (gender) {
        matchCriteria['gender'] = gender;
      }

      if (category_id) {
        matchCriteria['category_id'] = new mongoose.Types.ObjectId(category_id);
      }

      const sortCriteria = {};
      if (sortBy) {
        sortCriteria[sortBy] = parsedSortOrder ? 1 : -1;
      }

      if (isNaN(page)) {
        page = 1;
      }

      if (isNaN(pageSize) || pageSize <= 0) {
        pageSize = 10;
      }

      page = parseInt(page.toString(), 10);
      pageSize = parseInt(pageSize.toString(), 10);

      const aggregationPipeline = [
        { $match: matchCriteria },
        {
          $facet: {
            totalCount: [{ $count: 'value' }],
            paginatedDoctors: [
              {
                $sort:
                  Object.keys(sortCriteria).length > 0
                    ? sortCriteria
                    : { _id: 1 },
              },
              { $skip: (page - 1) * pageSize },
              { $limit: pageSize },
            ],
          },
        },
      ];

      const result = await this.doctorModel
        .aggregate(aggregationPipeline)
        .exec();

      if (result.length > 0) {
        const { totalCount, paginatedDoctors } = result[0];
        return {
          Doctors: paginatedDoctors,
          totalCount: totalCount[0] ? totalCount[0].value : 0,
        };
      } else {
        return { Doctors: [], totalCount: 0 };
      }
    } catch (error) {
      console.log(error);
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}

import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FitnessUser, Goal } from './schema/fitnessUser.schema';
import mongoose, { Model } from 'mongoose';
import { GoalDto } from './Dto/fitnessGoal.dto';

@Injectable()
export class FitnessService {
  constructor(
    @InjectModel(FitnessUser.name)
    private readonly fitnessUserModel: Model<FitnessUser>,
  ) {}

  async createFitnessUser(dto: GoalDto, profile_id: string) {
    try {
      if (!Object.values(Goal).includes(dto.goal as Goal)) {
        throw new ConflictException('wrong Type');
      }
      const userExist = await this.fitnessUserModel
        .findOne({
          profile_id: new mongoose.Types.ObjectId(profile_id),
          is_deleted: false,
        })
        .catch((err) => {
          throw new HttpException(
            'something went  wrong',
            HttpStatus.BAD_GATEWAY,
          );
        });

      console.log(userExist, 'exist');
      if (userExist) {
        throw new UnauthorizedException('user already exist');
      }

      const user = await new this.fitnessUserModel({
        profile_id: new mongoose.Types.ObjectId(profile_id),
        goal_weight: dto.goal_weight,
        goal: dto.goal,
      }).save();

      return {
        message: 'user created',
      };
    } catch (error) {
      throw error;
    }
  }

  async editFitnessUser(dto: GoalDto, profile_id: string) {
    try {
      console.log(profile_id);
      if (!Object.values(Goal).includes(dto.goal as Goal)) {
        throw new ConflictException('wrong Type');
      }
      const userExist = await this.fitnessUserModel
        .findOne({
          profile_id: new mongoose.Types.ObjectId(profile_id),
          is_deleted: false,
        })
        .catch((err) => {
          throw new HttpException(
            'something went  wrong',
            HttpStatus.BAD_GATEWAY,
          );
        });

      if (!userExist) {
        throw new UnauthorizedException('user does not exist');
      }

      await this.fitnessUserModel
        .findOneAndUpdate(
          { profile_id: new mongoose.Types.ObjectId(profile_id) },
          dto,
        )
        .catch((err) => {
          throw new HttpException(
            'something went wrong ',
            HttpStatus.BAD_GATEWAY,
          );
        });

      return { message: 'user has been  updated' };
    } catch (error) {
      throw error;
    }
  }

  async deleteFitnessUser(profile_id: string) {
    try {
      const userExist = await this.fitnessUserModel
        .findOne({
          profile_id: new mongoose.Types.ObjectId(profile_id),
          is_deleted: false,
        })
        .catch((err) => {
          throw new HttpException(
            'something went  wrong',
            HttpStatus.BAD_GATEWAY,
          );
        });

      if (!userExist) {
        throw new UnauthorizedException('user does not exist');
      }

      await this.fitnessUserModel.findOneAndUpdate(
        { profile_id: new mongoose.Types.ObjectId(profile_id) },
        { is_deleted: true },
      );
      return { message: 'account deleted' };
    } catch (error) {
      throw error;
    }
  }
  async getFitnessUser(profile_id: string) {
    try {
      const user = await this.fitnessUserModel
        .findOne({
          profile_id: new mongoose.Types.ObjectId(profile_id),
          is_deleted: false,
        })
        .populate('profile_id')
        .catch((err) => {
          throw new NotFoundException('user not found');
        });
      return user;
    } catch (error) {
      throw error;
    }
  }
}

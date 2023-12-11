import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { Model } from 'mongoose';
import { JwtPayload } from 'jwt-decode';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async getUserById(user_id: string) {
    const user = await this.userModel.findOne({ _id: user_id });

    if (user) return user;

    throw new UnauthorizedException('Email not registered');
  }

  async getUserProfile(user: JwtPayload) {
    const userData: any = await this.userModel.findOne({ _id: user.sub });
    return userData;
  }
}

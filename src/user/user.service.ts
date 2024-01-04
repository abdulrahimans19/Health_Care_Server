import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schema/user.schema';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from 'src/auth/strategies';
import { SignInDto, SignUpDto } from 'src/auth/dto';
import * as moment from 'moment';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(signUpDto.password, 10);
    const existingUser = await this.userModel.findOne({
      email: signUpDto.email,
    });

    if (existingUser) {
      if (existingUser.is_active === true) {
        throw new ConflictException('Email is already in use');
      } else {
        // Delete inactive user and create a new one
        await this.userModel.deleteOne({ email: signUpDto.email });
        return this.createUser(signUpDto, hashedPassword);
      }
    } else {
      // Create a new user
      return this.createUser(signUpDto, hashedPassword);
    }
  }

  async signIn(signInDto: SignInDto): Promise<User> {
    const { email, password } = signInDto;

    const user = await this.userModel.findOne({ email });

    if (!user || !user.is_active || user.is_deleted) {
      throw new UnauthorizedException('Invalid email or email not verified');
    }

    if (user.is_deactivated) {
      throw new UnauthorizedException('Account is deactivated');
    }

    if (!user.password) {
      throw new ConflictException(
        'Please set a password or use other login methods',
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    return user;
  }

  private async createUser(
    signUpDto: SignUpDto,
    hashedPassword: string,
  ): Promise<User> {
    const newUser = await this.userModel.create({
      email: signUpDto.email,
      password: hashedPassword,
    });

    return newUser;
  }

  async getUserById(userId: string): Promise<User> {
    const user = await this.userModel.findOne({ _id: userId });

    if (user) {
      return user;
    }

    throw new UnauthorizedException('User not found');
  }

  async getUserDataById(userId: string): Promise<User> {
    return await this.userModel.findOne({ _id: userId });
  }

  async getUserByEmail(email: string): Promise<User> {
    return await this.userModel.findOne({ email, is_active: true });
  }

  async updatePassword(email: string, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userModel.updateOne(
      { email },
      { $set: { password: hashedPassword } },
    );

    return { message: 'Password updated successfully' };
  }

  async setOtpNull(email: string) {
    await this.userModel.updateOne({ email }, { $set: { otp: null } });
  }

  async updateFcmToken(fcmToken: string, user: JwtPayload) {
    await this.userModel.updateOne(
      { _id: user.sub },
      { $set: { fcm_token: fcmToken } },
    );

    return { message: 'FCM token updated successfully' };
  }

  async verifyEmailOtp(email: string, otp: string): Promise<User> {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('Invalid email');
    }

    if (!user.otp) {
      throw new UnauthorizedException('OTP has expired');
    }

    const isOtpValid = await bcrypt.compare(otp, user.otp);

    if (!isOtpValid) {
      throw new UnauthorizedException('Invalid OTP');
    }

    await this.userModel.updateOne(
      { _id: user._id },
      { $set: { is_active: true } },
    );

    return user;
  }

  async updateOtp(email: string, otp: string) {
    const userExist = await this.userModel.findOne({ email });

    if (!userExist) {
      throw new NotFoundException('Email not registered');
    }

    const newOtp = await bcrypt.hash(otp, 10);

    await this.userModel.updateOne({ email }, { $set: { otp: newOtp } });

    return { message: 'OTP updated successfully' };
  }

  async updateUserActiveStatus(user: JwtPayload) {
    const userData = await this.userModel.findById(user.sub);
    await this.userModel.updateOne(
      { _id: user.sub },
      { $set: { is_deactivated: !userData.is_deactivated } },
    );
    return { message: 'Status Updated' };
  }

  async getUserCount() {
    try {
      const start = moment().subtract(6, 'months').startOf('month').toDate();
      const end = moment().endOf('month').toDate();

      const result = await this.userModel.aggregate([
        {
          $match: {
            created_at: { $gte: start, $lte: end },
            is_active: true,
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m', date: '$created_at' },
            },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            month: '$_id',
            count: 1,
          },
        },
        {
          $sort: { month: 1 },
        },
      ]);

      const formattedResult = result.map(({ month, count }) => ({
        month: moment(month, 'YYYY-MM').format('MMM'),
        count,
      }));

      return { user_count: formattedResult };
    } catch (error) {
      console.log(error);
    }
  }

  async getUsersForAdmin(dto: any): Promise<any> {
    try {
      let { search, sortBy, sortOrder, active, page = 1, limit = 10 } = dto;

      const matchCriteria = { roles: 'User' };
      if (search) {
        matchCriteria['$or'] = [
          { email: new RegExp(search, 'i') },
          { name: new RegExp(search, 'i') },
        ];
      }

      if (active) {
        let isActive: boolean = active === 'true';
        matchCriteria['is_active'] = isActive;
      }

      const sortCriteria = {};
      if (sortBy) {
        sortCriteria[sortBy] = sortOrder ? 1 : -1;
      }

      if (isNaN(page)) {
        page = 1;
      }

      if (isNaN(limit) || limit <= 0) {
        limit = 10;
      }

      page = parseInt(page.toString(), 10);
      limit = parseInt(limit.toString(), 10);

      const aggregationPipeline = [
        { $match: matchCriteria },
        {
          $facet: {
            totalCount: [{ $count: 'value' }],
            paginatedUsers: [
              {
                $sort:
                  Object.keys(sortCriteria).length > 0
                    ? sortCriteria
                    : { _id: 1 },
              },
              { $skip: (page - 1) * limit },
              { $limit: limit },
            ],
          },
        },
      ];

      const result = await this.userModel.aggregate(aggregationPipeline).exec();

      if (result.length > 0) {
        const { totalCount, paginatedUsers } = result[0];
        return {
          users: paginatedUsers,
          totalCount: totalCount[0] ? totalCount[0].value : 0,
        };
      } else {
        return { users: [], totalCount: 0 };
      }
    } catch (error) {
      console.log(error);
    }
  }

  async updateUserStatus(user_id: string) {
    const userData = await this.userModel.findOne({ _id: user_id });
    await this.userModel.updateOne(
      { _id: user_id },
      { $set: { is_active: !userData.is_active } },
    );

    return { message: 'Status Updated' };
  }
}

import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Coupon } from './schema/coupon.schema';
import { Model } from 'mongoose';
import { ApplyCouponDto, CreateCouponDto, UpdateCouponDto } from './dto';
import { JwtPayload } from 'src/auth/strategies';

@Injectable()
export class CouponService {
  constructor(
    @InjectModel(Coupon.name) private readonly couponModel: Model<Coupon>,
  ) {}

  async getAllCoupon() {
    const coupons = await this.couponModel.find().sort({ created_at: -1 });
    return { coupons };
  }

  async getCouponForUser(user: JwtPayload) {
    const currentDate = new Date();
    const coupons = await this.couponModel
      .find({
        user_id: { $nin: [user.sub] },
        expiry_date: { $gt: currentDate },
      })
      .sort({ created_at: -1 })
      .exec();

    return { coupons };
  }

  async createCoupon(dto: CreateCouponDto) {
    await this.couponModel.create({
      code: dto.code,
      min_amount: dto.min_amount,
      expiry_date: dto.expiry_date,
      discount_percentage: dto.discount_percentage,
    });

    return { message: 'Coupon Created.' };
  }

  async updateCoupon(dto: UpdateCouponDto) {
    await this.couponModel.updateOne(
      { _id: dto.coupon_id },
      {
        $set: {
          code: dto.code,
          min_amount: dto.min_amount,
          expiry_date: dto.expiry_date,
          discount_percentage: dto.discount_percentage,
        },
      },
    );

    return { message: 'Coupon Updated.' };
  }

  async applyCoupon(user: JwtPayload, dto: ApplyCouponDto) {
    const currentDate = new Date();
    const coupon = await this.couponModel.findOne({
      code: dto.code,
      user_id: { $nin: [user.sub] },
      expiry_date: { $gt: currentDate },
    });

    if (!coupon) {
      throw new ConflictException('Invalid Coupon.');
    }

    if (coupon.min_amount > dto.amount) {
      throw new ConflictException(
        `Minimum coupon amount is ${coupon.min_amount}`,
      );
    }

    const discountAmount = (dto.amount * coupon.discount_percentage) / 100;
    return { discountAmount };
  }
}

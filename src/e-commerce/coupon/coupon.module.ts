import { Module } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CouponController } from './coupon.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Coupon, coupon_schema } from './schema/coupon.schema';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Coupon.name, schema: coupon_schema }]),
    UserModule,
  ],
  providers: [CouponService],
  controllers: [CouponController],
})
export class CouponModule {}

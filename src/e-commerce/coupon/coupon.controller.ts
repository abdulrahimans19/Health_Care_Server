import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { GetUser, Roles } from 'src/shared/decorators';
import { JwtPayload } from 'src/auth/strategies';
import { ApplyCouponDto, CreateCouponDto, UpdateCouponDto } from './dto';
import { RoleGuard } from 'src/shared/guards';
import { UserRoles } from 'src/user/schema/user.schema';

@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Get()
  getCoupon(@GetUser() user: JwtPayload) {
    return this.couponService.getCouponForUser(user);
  }

  @Get('/get-all')
  getAllCoupons() {
    return this.couponService.getAllCoupon();
  }

  @Post('/apply')
  applyCoupon(@GetUser() user: JwtPayload, @Body() dto: ApplyCouponDto) {
    return this.couponService.applyCoupon(user, dto);
  }

  @Post('/create')
  @Roles(UserRoles.ADMIN)
  @UseGuards(RoleGuard)
  createCoupon(@Body() dto: CreateCouponDto) {
    return this.couponService.createCoupon(dto);
  }

  @Put('/update')
  @Roles(UserRoles.ADMIN)
  @UseGuards(RoleGuard)
  updateCoupon(@Body() dto: UpdateCouponDto) {
    return this.couponService.updateCoupon(dto);
  }
}

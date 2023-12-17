import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { GetProfileId } from 'src/shared/decorators/get-profile-id.decorator';
import { CartCheckoutDto } from './dto';
import { product_types } from '../types';
import { ProfileGuard } from 'src/shared/guards';
import { GetUser } from 'src/shared/decorators';
import { JwtPayload } from 'src/auth/strategies';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('/pharma/orders')
  getPharmaOrders(
    @GetProfileId() profile_id: string,
    @Query('payment_status') payment_status: string,
  ) {
    return this.orderService.getProfileOrder(
      profile_id,
      product_types.PHARMA,
      payment_status,
    );
  }

  @Get('/food/orders')
  getFoodOrders(
    @GetProfileId() profile_id: string,
    @Query('payment_status') payment_status: string,
  ) {
    return this.orderService.getProfileOrder(
      profile_id,
      product_types.FOOD,
      payment_status,
    );
  }

  @Post('pharma/cart-checkout')
  @UseGuards(ProfileGuard)
  pharmaCartCheckout(
    @GetProfileId() profile_id: string,
    @GetUser() user: JwtPayload,
    @Body() dto: CartCheckoutDto,
  ) {
    return this.orderService.pharmaCartCheckout(profile_id, user, dto);
  }

  @Post('food/cart-checkout')
  @UseGuards(ProfileGuard)
  foodCartCheckout(
    @GetProfileId() profile_id: string,
    @GetUser() user: JwtPayload,
    @Body() dto: CartCheckoutDto,
  ) {
    return this.orderService.foodCartCheckout(profile_id, user, dto);
  }
}

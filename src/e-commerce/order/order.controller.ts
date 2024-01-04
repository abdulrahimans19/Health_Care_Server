import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { GetProfileId } from 'src/shared/decorators/get-profile-id.decorator';
import { CartCheckoutDto, ValidatePaymentDto } from './dto';
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
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ) {
    return this.orderService.getProfileOrder(
      profile_id,
      product_types.PHARMA,
      payment_status,
      page,
      pageSize,
    );
  }

  @Get('/food/orders')
  getFoodOrders(
    @GetProfileId() profile_id: string,
    @Query('payment_status') payment_status: string,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ) {
    return this.orderService.getProfileOrder(
      profile_id,
      product_types.FOOD,
      payment_status,
      page,
      pageSize,
    );
  }

  @Get('/pharma/all-orders')
  getAllPharmaOrders(
    @Query('payment_status') payment_status: string,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ) {
    return this.orderService.getAllOrder(
      product_types.PHARMA,
      payment_status,
      page,
      pageSize,
    );
  }

  @Get('/food/all-orders')
  getAllFoodOrders(
    @Query('payment_status') payment_status: string,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ) {
    return this.orderService.getAllOrder(
      product_types.FOOD,
      payment_status,
      page,
      pageSize,
    );
  }

  @Get('/pharma/order-count')
  getPharmaOrdersCount(
    @Query('payment_status') payment_status: string,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ) {
    return this.orderService.getAllOrderCount(
      product_types.PHARMA,
      payment_status,
      page,
      pageSize,
    );
  }

  @Get('/food/order-count')
  getFoodOrdersCount(
    @Query('payment_status') payment_status: string,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ) {
    return this.orderService.getAllOrderCount(
      product_types.FOOD,
      payment_status,
      page,
      pageSize,
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

  @Post('/pharma/validate-payment')
  validatePharmaOrderPayment(
    @GetUser() user: JwtPayload,
    @GetProfileId() profile_id: string,
    @Body() dto: ValidatePaymentDto,
  ) {
    return this.orderService.validateOrderPayment(
      user,
      profile_id,
      dto,
      product_types.PHARMA,
    );
  }

  @Post('/food/validate-payment')
  validateFoodOrderPayment(
    @GetUser() user: JwtPayload,
    @GetProfileId() profile_id: string,
    @Body() dto: ValidatePaymentDto,
  ) {
    return this.orderService.validateOrderPayment(
      user,
      profile_id,
      dto,
      product_types.FOOD,
    );
  }
}

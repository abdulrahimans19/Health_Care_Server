import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { GetProfileId } from 'src/shared/decorators/get-profile-id.decorator';
import { CartCheckoutDto } from './dto';
import { product_types } from '../types';
import { ProfileGuard } from 'src/shared/guards';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('/pharma/orders')
  getPharmaOrders(@GetProfileId() profile_id: string) {
    return this.orderService.getProfileOrder(profile_id, product_types.PHARMA);
  }

  @Post('pharma/cart-checkout')
  @UseGuards(ProfileGuard)
  pharmaCartCheckout(
    @GetProfileId() profile_id: string,
    @Body() dto: CartCheckoutDto,
  ) {
    return this.orderService.pharmaCartCheckout(profile_id, dto);
  }
}

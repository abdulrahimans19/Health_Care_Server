import { Body, Controller, Post } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { GetUser } from 'src/shared/decorators';
import { JwtPayload } from 'src/auth/strategies';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('/create-stripe-payment')
  async createStripePayment(@GetUser() user: JwtPayload, @Body() dto) {
    const payment_id = await this.paymentService.createStripeOrder(
      user.email,
      dto.amount,
      'AED',
    );
    return { payment_id };
  }
}

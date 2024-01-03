import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, order_schema } from './schema/order.schema';
import { Cart, cart_schema } from '../cart/schema/cart.schema';
import {
  UserProfile,
  user_profile_schema,
} from 'src/user-profile/schema/user-profile.schema';
import { UserModule } from 'src/user/user.module';
import { Coupon, coupon_schema } from '../coupon/schema/coupon.schema';
import { PaymentModule } from 'src/payment/payment.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: order_schema },
      { name: Cart.name, schema: cart_schema },
      { name: UserProfile.name, schema: user_profile_schema },
      { name: Coupon.name, schema: coupon_schema },
    ]),
    UserModule,
    PaymentModule,
  ],
  providers: [OrderService],
  controllers: [OrderController],
})
export class OrderModule {}

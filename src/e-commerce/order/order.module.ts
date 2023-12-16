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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: order_schema },
      { name: Cart.name, schema: cart_schema },
      { name: UserProfile.name, schema: user_profile_schema },
    ]),
    UserModule,
  ],
  providers: [OrderService],
  controllers: [OrderController],
})
export class OrderModule {}

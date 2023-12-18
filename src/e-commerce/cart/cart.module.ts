import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Cart, cart_schema } from './schema/cart.schema';
import { Product, product_schema } from '../product/schema/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cart.name, schema: cart_schema },
      { name: Product.name, schema: product_schema },
    ]),
  ],
  providers: [CartService],
  exports:[CartService],
  controllers: [CartController],
})
export class CartModule {}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from './schema/order.schema';
import { Model } from 'mongoose';
import { Cart } from '../cart/schema/cart.schema';
import { CartCheckoutDto } from './dto';
import { calculateTotalPrice } from '../utils/utils';
import { product_types } from '../types';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    @InjectModel(Cart.name) private readonly cartModel: Model<Cart>,
  ) { }

  async getProfileOrder(profile_id: string, product_type: product_types) {
    return await this.orderModel
      .find({ profile_id, product_type })
      .populate({
        path: 'products.product',
        model: 'Product',
      })
      .populate({
        path: 'address_id',
        model: 'Address',
      })
      .sort({ created_at: -1 });
  }

  async pharmaCartCheckout(profile_id: string, dto: CartCheckoutDto) {
    const cart: any = await this.cartModel
      .findOne({ profile_id: profile_id })
      .populate({
        path: 'pharma_products.product',
      });
    if (!cart || cart.pharma_products.length === 0) {
      throw new NotFoundException('Cart is empty');
    }

    const productsForOrder = cart.pharma_products.map((cartProduct) => ({
      product: cartProduct.product._id,
      quantity: cartProduct.quantity,
      price:
        cartProduct.product.offer_price === 0
          ? cartProduct.product.price
          : cartProduct.product.offer_price,
    }));

    const total_amount = calculateTotalPrice(cart.pharma_products);

    const order = await this.orderModel.create({
      products: productsForOrder,
      profile_id,
      total_amount,
      address_id: dto.address_id,
      product_type: product_types.PHARMA,
    });

    return { message: 'Order created.' };
  }
}

import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import { Order, OrderStatus } from './schema/order.schema';
import { Cart } from '../cart/schema/cart.schema';
import { CartCheckoutDto, ValidatePaymentDto } from './dto';
import { calculateTotalPrice } from '../utils/utils';
import { product_types } from '../types';
import { Coupon } from '../coupon/schema/coupon.schema';
import { JwtPayload } from 'src/auth/strategies';
import { PaymentService } from 'src/payment/payment.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    @InjectModel(Cart.name) private readonly cartModel: Model<Cart>,
    @InjectModel(Coupon.name) private readonly couponModel: Model<Coupon>,
    private readonly paymentService: PaymentService,
  ) {}

  async getProfileOrder(
    profile_id: string,
    product_type: product_types,
    payment_status: string,
  ) {
    return this.orderModel
      .find({
        profile_id: new Types.ObjectId(profile_id),
        product_type,
        order_status: payment_status,
      })
      .populate({
        path: 'product_id',
        model: 'Product',
      })
      .populate({
        path: 'address_id',
        model: 'Address',
      })
      .populate({
        path: 'review_id',
        model: 'Review',
      })
      .sort({ created_at: -1 });
  }

  private async checkout(
    profile_id: string,
    user: JwtPayload,
    dto: CartCheckoutDto,
    product_type: product_types,
    cartField: string,
  ) {
    let session: ClientSession;

    try {
      session = await this.orderModel.startSession();
      session.startTransaction();

      const cart: any = await this.cartModel.findOne({ profile_id }).populate({
        path: `${cartField}.product`,
        model: 'Product',
      });

      if (!cart || cart[cartField].length === 0) {
        throw new NotFoundException('Cart is empty');
      }

      for (const cartProduct of cart[cartField]) {
        if (cartProduct.quantity > cartProduct.product.quantity) {
          throw new ConflictException(
            `Insufficient stock for product ${cartProduct.product.name}`,
          );
        }
      }

      let total_amount = calculateTotalPrice(cart[cartField]);
      let coupon_exist: Coupon;
      let discountPercentage: number;

      if (dto.coupon) {
        const currentDate = new Date();
        coupon_exist = await this.couponModel.findOne({
          code: dto.coupon,
          user_id: { $nin: [user.sub] },
          expiry_date: { $gt: currentDate },
        });

        if (!coupon_exist) {
          throw new ConflictException('Invalid Coupon');
        }

        if (total_amount < coupon_exist.min_amount) {
          throw new ConflictException(
            `Min order amount is ${coupon_exist.min_amount}`,
          );
        }

        discountPercentage = coupon_exist.discount_percentage || 0;
        let payable_total_amount = calculateTotalPrice(cart[cartField]);
        const discountAmount =
          (payable_total_amount * discountPercentage) / 100;
        payable_total_amount = payable_total_amount - discountAmount;

        let payment_id;
        if (dto.payment_mode === 'PAYPAL') {
          payment_id = await this.paymentService.createPaypalOrder(
            total_amount,
          );
        } else {
          payment_id = await this.paymentService.createStripeOrder(
            user.email,
            total_amount,
            'INR',
          );
        }

        const orderPromises = cart[cartField].map(async (cartProduct) => {
          const productTotalAmount =
            cartProduct.quantity * cartProduct.product.price;
          const discountAmount =
            (productTotalAmount * discountPercentage) / 100;

          total_amount -= discountAmount;

          const realTotalAmount = productTotalAmount;
          const discountedAmount = productTotalAmount - discountAmount;

          cartProduct.product.quantity -= cartProduct.quantity;
          cartProduct.product.product_sold += cartProduct.quantity;
          await cartProduct.product.save();

          return this.orderModel.create(
            [
              {
                profile_id,
                payment_id,
                product_id: cartProduct.product._id,
                quantity: cartProduct.quantity,
                total_amount: discountedAmount,
                real_total_amount: realTotalAmount,
                discounted_amount: discountAmount,
                address_id: dto.address_id,
                order_status: OrderStatus.PENDING,
                product_type,
              },
            ],
            { session } as { session: ClientSession },
          );
        });

        const orders = await Promise.all(orderPromises);

        await this.couponModel.updateOne(
          { code: dto.coupon },
          { $push: { user_id: new Types.ObjectId(user.sub) } },
          { session } as { session: ClientSession },
        );

        await session.commitTransaction();
        session.endSession();

        return {
          message: 'Order created.',
          orders,
          total_amount: payable_total_amount,
          payment_id,
        };
      } else {
        let payment_id;
        if (dto.payment_mode === 'PAYPAL') {
          payment_id = await this.paymentService.createPaypalOrder(
            total_amount,
          );
        } else {
          payment_id = await this.paymentService.createStripeOrder(
            user.email,
            total_amount,
            'INR',
          );
        }
        const orderPromises = cart[cartField].map(async (cartProduct) => {
          const totalAmount = cartProduct.quantity * cartProduct.product.price;

          const realTotalAmount = totalAmount;
          const discountedAmount = totalAmount;

          cartProduct.product.quantity -= cartProduct.quantity;
          cartProduct.product.product_sold += cartProduct.quantity;
          await cartProduct.product.save();

          return this.orderModel.create(
            [
              {
                profile_id,
                payment_id,
                product_id: cartProduct.product._id,
                quantity: cartProduct.quantity,
                total_amount: discountedAmount,
                real_total_amount: realTotalAmount,
                discounted_amount: discountedAmount,
                address_id: dto.address_id,
                order_status: OrderStatus.PENDING,
                product_type,
              },
            ],
            { session } as { session: ClientSession },
          );
        });

        const orders = await Promise.all(orderPromises);

        total_amount = calculateTotalPrice(cart[cartField]);
        const discountAmount = 0;
        total_amount = total_amount - discountAmount;

        await session.commitTransaction();
        session.endSession();

        return { message: 'Order created.', orders, total_amount, payment_id };
      }
    } catch (error) {
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
      console.error(error);
      throw error;
    }
  }

  async pharmaCartCheckout(
    profile_id: string,
    user: JwtPayload,
    dto: CartCheckoutDto,
  ) {
    try {
      return this.checkout(
        profile_id,
        user,
        dto,
        product_types.PHARMA,
        'pharma_products',
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async foodCartCheckout(
    profile_id: string,
    user: JwtPayload,
    dto: CartCheckoutDto,
  ) {
    return this.checkout(
      profile_id,
      user,
      dto,
      product_types.FOOD,
      'food_products',
    );
  }

  async validateOrderPayment(dto: ValidatePaymentDto) {
    let payment_status: boolean;
    if (dto.payment_mode === 'STRIPE') {
      payment_status = await this.paymentService.validateStripeOrder(
        dto.payment_id,
      );
    } else {
      payment_status = await this.paymentService.validatePaypalPayment(
        dto.payment_id,
      );
    }
    if (payment_status) {
      await this.orderModel.updateMany(
        { payment_id: dto.payment_id },
        { $set: { order_status: OrderStatus.SHIPPED, status: 2 } },
      );

      return { message: 'Payment Successfull Order Created.' };
    } else {
      throw new ConflictException('Payment Failed.');
    }
  }
}

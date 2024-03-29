import {
  ConflictException,
  Injectable,
  NotFoundException,
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
import * as moment from 'moment';

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
    page: number = 1,
    pageSize: number = 10,
  ) {
    const skip = (page - 1) * pageSize;
    const orders = await this.orderModel
      .find({
        profile_id: new Types.ObjectId(profile_id),
        product_type,
        // order_status: payment_status,
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
      .skip(skip)
      .limit(pageSize)
      .sort({ created_at: -1 });

    return { orders };
  }

  async getAllOrder(
    product_type: product_types,
    payment_status: string,
    page: number = 1,
    pageSize: number = 10,
  ) {
    const skip = (page - 1) * pageSize;
    const orders = await this.orderModel
      .find({
        product_type,
        // order_status: payment_status,
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
      .skip(skip)
      .limit(pageSize)
      .sort({ created_at: -1 });
    const total_order_count = await this.orderModel.countDocuments({
      product_type,
    });

    return { orders, total_order_count };
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

      // Fetch the cart with populated product details
      const cart: any = await this.cartModel
        .findOne({ profile_id })
        .populate({
          path: `${cartField}.product`,
          model: 'Product',
        })
        .session(session);

      if (!cart || cart[cartField].length === 0) {
        throw new NotFoundException('Cart is empty');
      }

      // Check stock availability for each product in the cart
      for (const cartProduct of cart[cartField]) {
        if (cartProduct.quantity > cartProduct.product.quantity) {
          throw new ConflictException(
            `Insufficient stock for product ${cartProduct.product.name}`,
          );
        }
      }

      // Calculate the total amount before applying discounts
      let total_amount = calculateTotalPrice(cart[cartField]);
      let discountPercentage: number;

      // Check if a coupon is provided in the DTO
      if (dto.coupon) {
        const currentDate = new Date();
        const coupon_exist = await this.couponModel
          .findOne({
            code: dto.coupon,
            user_id: { $nin: [user.sub] },
            expiry_date: { $gt: currentDate },
          })
          .session(session);

        if (!coupon_exist) {
          throw new ConflictException('Invalid Coupon');
        }

        if (total_amount < coupon_exist.min_amount) {
          throw new ConflictException(
            `Min order amount is ${coupon_exist.min_amount}`,
          );
        }

        discountPercentage = coupon_exist.discount_percentage || 0;

        // Calculate discounted amount and update total_amount
        let payable_total_amount = calculateTotalPrice(cart[cartField]);
        const discountAmount =
          (payable_total_amount * discountPercentage) / 100;
        payable_total_amount = payable_total_amount - discountAmount;

        // Create payment ID based on the selected payment mode
        let payment_id;
        if (dto.payment_mode === 'PAYPAL') {
          payment_id = null;
        } else {
          payment_id = await this.paymentService.createStripeOrder(
            user.email,
            payable_total_amount, // Use payable_total_amount for Stripe
            'INR',
          );
        }

        // Create an array of order creation promises
        const orderPromises = cart[cartField].map(async (cartProduct) => {
          const productTotalAmount =
            cartProduct.quantity * cartProduct.product.price;
          const discountAmount =
            (productTotalAmount * discountPercentage) / 100;

          total_amount -= discountAmount;

          const realTotalAmount = productTotalAmount;
          const discountedAmount = productTotalAmount - discountAmount;

          // Update product quantity and product_sold fields
          if (dto.payment_mode === 'PAYPAL') {
            cartProduct.product.quantity -= cartProduct.quantity;
            cartProduct.product.product_sold += cartProduct.quantity;
            await cartProduct.product.save();
          }

          // Create and return an order document
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
                order_status:
                  dto.payment_mode === 'STRIPE'
                    ? OrderStatus.PENDING
                    : OrderStatus.CREATED,
                product_type,
              },
            ],
            { session } as { session: ClientSession },
          );
        });

        // Execute all order creation promises in parallel
        const orders = await Promise.all(orderPromises);

        await this.cartModel.updateOne(
          { profile_id },
          {
            $set: {
              [product_type === product_types.PHARMA
                ? 'pharma_products'
                : 'food_products']: [],
            },
          },
          { session } as { session: ClientSession },
        );

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        return {
          message: 'Order created.',
          orders,
          total_amount: payable_total_amount,
          payment_id,
        };
      } else {
        // If no coupon, proceed without discounts
        let payment_id;
        if (dto.payment_mode === 'PAYPAL') {
          payment_id = null;
        } else {
          payment_id = await this.paymentService.createStripeOrder(
            user.email,
            total_amount,
            'INR',
          );
        }

        // Create an array of order creation promises
        const orderPromises = cart[cartField].map(async (cartProduct) => {
          const totalAmount = cartProduct.quantity * cartProduct.product.price;

          const realTotalAmount = totalAmount;
          const discountedAmount = totalAmount;

          // Update product quantity and product_sold fields
          if (dto.payment_mode === 'PAYPAL') {
            cartProduct.product.quantity -= cartProduct.quantity;
            cartProduct.product.product_sold += cartProduct.quantity;
            await cartProduct.product.save();
          }

          // Create and return an order document
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
                order_status:
                  dto.payment_mode === 'STRIPE'
                    ? OrderStatus.PENDING
                    : OrderStatus.CREATED,
                product_type,
              },
            ],
            { session } as { session: ClientSession },
          );
        });

        // Execute all order creation promises in parallel
        const orders = await Promise.all(orderPromises);

        // Update total_amount without discounts
        total_amount = calculateTotalPrice(cart[cartField]);
        const discountAmount = 0;
        total_amount = total_amount - discountAmount;

        await this.cartModel.updateOne(
          { profile_id },
          {
            $set: {
              [product_type === product_types.PHARMA
                ? 'pharma_products'
                : 'food_products']: [],
            },
          },
          { session } as { session: ClientSession },
        );

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        return { message: 'Order created.', orders, total_amount, payment_id };
      }
    } catch (error) {
      // Rollback the transaction in case of an error
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

  async validateOrderPayment(
    user: JwtPayload,
    profile_id: string,
    dto: ValidatePaymentDto,
    product_type: product_types,
  ) {
    let payment_status: boolean = true;

    // if (dto.payment_mode === 'STRIPE') {
    //   payment_status = await this.paymentService.validateStripeOrder(
    //     dto.payment_id,
    //   );
    // } else {
    //   payment_status = await this.paymentService.validatePaypalPayment(
    //     dto.payment_id,
    //   );
    // }

    if (payment_status) {
      // Update order status to SHIPPED
      const existingOrder = await this.orderModel.findOne({
        payment_id: dto.payment_id,
      });
      if (existingOrder?.status === 2)
        throw new ConflictException('Order already validated.');
      await this.orderModel.updateMany(
        { payment_id: dto.payment_id },
        { $set: { order_status: OrderStatus.SHIPPED, status: 2 } },
      );

      // Fetch the cart after payment validation
      const cart: any = await this.cartModel.findOne({ profile_id }).populate({
        path: `${
          product_type === product_types.PHARMA
            ? 'pharma_products'
            : 'food_products'
        }.product`,
        model: 'Product',
      });

      if (
        !cart ||
        cart[
          product_type === product_types.PHARMA
            ? 'pharma_products'
            : 'food_products'
        ].length === 0
      ) {
        throw new NotFoundException('Cart is empty');
      }

      // Update product quantity and product_sold fields
      for (const cartProduct of cart[
        product_type === product_types.PHARMA
          ? 'pharma_products'
          : 'food_products'
      ]) {
        const { product, quantity } = cartProduct;

        product.quantity -= quantity;
        product.product_sold += quantity;
        await product.save();
      }

      await this.couponModel.updateOne(
        { code: dto.coupon },
        { $addToSet: { user_id: new Types.ObjectId(user.sub) } },
      );

      // Clear the cart after processing
      await this.cartModel.updateOne(
        { profile_id },
        {
          $set: {
            [product_type === product_types.PHARMA
              ? 'pharma_products'
              : 'food_products']: [],
          },
        },
      );

      return { message: 'Payment Successful. Order Created.' };
    } else {
      throw new ConflictException('Payment Failed.');
    }
  }

  async getAllOrderCount(
    product_type: product_types,
    payment_status: string,
    page: number = 1,
    pageSize: number = 10,
  ) {
    try {
      const skip = (page - 1) * pageSize;

      const start = moment().subtract(6, 'months').startOf('month').toDate();
      const end = moment().endOf('month').toDate();

      // Ensure pageSize is a number
      const pageSizeAsNumber = parseInt(`${pageSize}`, 10);

      if (isNaN(pageSizeAsNumber) || pageSizeAsNumber <= 0) {
        throw new Error('Invalid pageSize');
      }

      const result = await this.orderModel.aggregate([
        {
          $match: {
            created_at: { $gte: start, $lte: end },
            product_type,
            // Add other conditions as needed
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m', date: '$created_at' },
            },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            month: '$_id',
            count: 1,
          },
        },
        {
          $sort: { month: 1 },
        },
        {
          $skip: skip,
        },
        {
          $limit: pageSizeAsNumber,
        },
      ]);

      const formattedResult = result.map(({ month, count }) => ({
        month: moment(month, 'YYYY-MM').format('MMM'),
        count,
      }));

      return { order_count: formattedResult };
    } catch (error) {
      console.error(error);
      // Handle the error appropriately, e.g., throw a custom exception or return an error response.
      throw new Error('Failed to retrieve order count');
    }
  }
}

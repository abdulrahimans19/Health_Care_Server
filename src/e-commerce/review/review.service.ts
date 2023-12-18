import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Review } from './schema/review.schema';
import { Model, Types } from 'mongoose';
import { Product } from '../product/schema/product.schema';
import { CreateReviewDto } from './dto';
import { Order } from '../order/schema/order.schema';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name) private readonly reviewModel: Model<Review>,
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
  ) {}

  async addReview(profile_id: string, dto: CreateReviewDto) {
    const existingReview = await this.reviewModel.findOne({
      profile_id,
      product_id: dto.product_id,
    });

    if (existingReview) {
      throw new ConflictException(
        'You have already submitted a review for this product.',
      );
    }

    const orderExist = await this.orderModel.findOne({
      profile_id,
      product_id: dto.product_id,
    });

    if (!orderExist)
      throw new ConflictException("You haven't purchased this product.");

    const product: any = await this.productModel
      .findById(dto.product_id)
      .populate('reviews');

    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    const rating = await this.reviewModel.create({
      profile_id,
      rating: dto.rating,
      comment: dto.comment,
      product_id: dto.product_id,
    });

    orderExist.review_id = new Types.ObjectId(rating._id);

    const totalRating = product.reviews.reduce(
      (total, review) => total + review.rating,
      0,
    );
    product.reviews.push(rating._id);

    product.averageRating = (totalRating + dto.rating) / product.reviews.length;
    product.review_count = product.review_count + 1;
    await product.save();
    await orderExist.save();
    return { message: 'Review added.' };
  }
}

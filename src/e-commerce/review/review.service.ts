import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Review } from './schema/review.schema';
import { Model } from 'mongoose';
import { Product } from '../product/schema/product.schema';
import { CreateReviewDto } from './dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name) private readonly reviewModel: Model<Review>,
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
  ) {}

  async addReview(profile_id: string, dto: CreateReviewDto) {
    // Check if the user has already submitted a review for this product
    const existingReview = await this.reviewModel.findOne({
      profile_id,
      product_id: dto.product_id,
    });

    if (existingReview) {
      throw new ConflictException(
        'You have already submitted a review for this product.',
      );
    }

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

    const totalRating = product.reviews.reduce(
      (total, review) => total + review.rating,
      0,
    );
    product.reviews.push(rating._id);

    // Calculate the new average rating
    product.averageRating = (totalRating + dto.rating) / product.reviews.length;

    // Save the updated product
    await product.save();

    return { message: 'Review added.' };
  }
}

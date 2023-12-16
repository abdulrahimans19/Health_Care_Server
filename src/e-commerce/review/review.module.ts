import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Review, review_schema } from './schema/review.schema';
import { Product, product_schema } from '../product/schema/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Review.name, schema: review_schema }]),
    MongooseModule.forFeature([{ name: Product.name, schema: product_schema }]),
  ],
  providers: [ReviewService],
  controllers: [ReviewController],
})
export class ReviewModule {}

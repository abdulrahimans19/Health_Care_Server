import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ReviewService } from './review.service';
import { GetProfileId } from 'src/shared/decorators/get-profile-id.decorator';
import { CreateReviewDto } from './dto';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post('/add')
  addReview(@GetProfileId() profile_id: string, @Body() dto: CreateReviewDto) {
    return this.reviewService.addReview(profile_id, dto);
  }

  @Get('/get-revew/:product_id')
  getProductReviews(
    @Param('product_id') product_id: string,
    @Query('pageSize') pageSize: number,
    @Query('page') page: number,
  ) {
    return this.reviewService.getProductReview(product_id, pageSize, page);
  }
}

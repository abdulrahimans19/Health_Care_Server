import { Body, Controller, Post } from '@nestjs/common';
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
}

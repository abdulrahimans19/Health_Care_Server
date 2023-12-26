import { Controller, Get, Post } from '@nestjs/common';
import { RecentSearchService } from './recent-search.service';
import { GetProfileId } from 'src/shared/decorators/get-profile-id.decorator';
import { product_types } from '../types';

@Controller('recent-search')
export class RecentSearchController {
  constructor(private readonly recentSearchService: RecentSearchService) {}

  @Get()
  getPharma(@GetProfileId() profile_id: string) {
    return this.recentSearchService.getRecentSearch(profile_id);
  }
}

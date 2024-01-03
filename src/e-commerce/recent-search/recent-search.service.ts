import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RecentSearch } from './schema/recent-search.schema';
import { Model } from 'mongoose';
import { product_types } from '../types';

@Injectable()
export class RecentSearchService {
  constructor(
    @InjectModel(RecentSearch.name)
    private readonly recentSearchModel: Model<RecentSearch>,
  ) {}

  async addToRecentSearch(
    profile_id: string,
    type: product_types,
    keyword: string,
  ) {
    try {
      const maxRecentSearches = 5;
      const update_field =
        type === product_types.FOOD ? 'food_search' : 'pharma_search';
  
      await this.recentSearchModel.updateOne(
        { profile_id },
        {
          $push: {
            [update_field]: {
              $each: [keyword],
              $slice: -maxRecentSearches,
            },
          },
        },
        { upsert: true } // Use upsert to create a new document if it doesn't exist
      );
  
      return { message: 'Added' };
    } catch (error) {
      console.log(error);
    }
  }  

  async getRecentSearch(profile_id: string) {
    const search = await this.recentSearchModel.findOne({ profile_id });
    return { search };
  }
}

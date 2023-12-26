import { Module } from '@nestjs/common';
import { RecentSearchService } from './recent-search.service';
import { RecentSearchController } from './recent-search.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  RecentSearch,
  recent_search_schema,
} from './schema/recent-search.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RecentSearch.name, schema: recent_search_schema },
    ]),
  ],
  providers: [RecentSearchService],
  exports: [RecentSearchService],
  controllers: [RecentSearchController],
})
export class RecentSearchModule {}

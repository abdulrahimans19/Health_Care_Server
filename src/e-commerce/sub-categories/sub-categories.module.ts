import { Module } from '@nestjs/common';
import { SubCategoriesService } from './sub-categories.service';
import { SubCategoriesController } from './sub-categories.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SubCategories,
  sub_category_schema,
} from './schema/sub-categories.schema';
import {
  MainCategories,
  main_category_schema,
} from '../main-categories/schema/main-categories.schema';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SubCategories.name, schema: sub_category_schema },
      { name: MainCategories.name, schema: main_category_schema },
    ]),
    UserModule,
  ],
  providers: [SubCategoriesService],
  controllers: [SubCategoriesController],
})
export class SubCategoriesModule {}

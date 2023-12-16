import { Module } from '@nestjs/common';
import { MainCategoriesService } from './main-categories.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  MainCategories,
  main_category_schema,
} from './schema/main-categories.schema';
import { MainCategoriesController } from './main-categories.controller';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MainCategories.name, schema: main_category_schema },
    ]),
    UserModule,
  ],
  providers: [MainCategoriesService],
  controllers: [MainCategoriesController],
})
export class MainCategoriesModule {}

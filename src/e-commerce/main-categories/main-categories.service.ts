import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MainCategories } from './schema/main-categories.schema';
import { CreateMainCategoryDto, UpdateMainCategoryDto } from './dto';
import { product_types } from '../types';

@Injectable()
export class MainCategoriesService {
  constructor(
    @InjectModel(MainCategories.name)
    private readonly mainCategoryModel: Model<MainCategories>,
  ) {}

  async getAllCategoriesByType(product_type: product_types) {
    const mainCategories = await this.mainCategoryModel.find({
      product_type: product_type,
    });

    return { mainCategories };
  }

  async getSingleCategory(id: string) {
    return await this.mainCategoryModel.findOne({ _id: id });
  }

  async createMainCategory(
    dto: CreateMainCategoryDto,
    product_type: product_types,
  ) {
    await this.mainCategoryModel.create({
      title: dto.title,
      image: dto.image,
      description: dto.description,
      product_type: product_type,
    });

    return { message: 'Main Category created.' };
  }

  async updateMainCategory(dto: UpdateMainCategoryDto) {
    await this.mainCategoryModel.updateOne(
      { _id: dto.category_id },
      {
        $set: {
          title: dto.title,
          image: dto.image,
          description: dto.description,
        },
      },
    );

    return { message: 'Main Category updated.' };
  }
}

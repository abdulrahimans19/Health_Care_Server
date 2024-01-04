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

  async search(query: string) {
    const regex = new RegExp(query, 'i');
    const categories = await this.mainCategoryModel
      .find({
        $or: [{ title: { $regex: regex } }, { description: { $regex: regex } }],
      })
      .exec();

    return { categories };
  }
  async getAllCategoriesByTypeForAdmin(
    product_type: product_types,
    page: number = 1,
    pageSize: number = 10,
  ) {
    const skip = (page - 1) * pageSize;

    const query: any = {
      product_type: product_type,
    };

    // Get the total count of documents matching the query
    const totalCount = await this.mainCategoryModel.countDocuments(query);

    const mainCategories = await this.mainCategoryModel
      .find(query)
      .skip(skip)
      .limit(pageSize);

    return { mainCategories, totalCount };
  }
}

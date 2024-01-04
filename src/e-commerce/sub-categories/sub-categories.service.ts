import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MainCategories } from '../main-categories/schema/main-categories.schema';
import { Model } from 'mongoose';
import { SubCategories } from './schema/sub-categories.schema';
import { CreateSubCategoryDto, UpdateSubCategoryDto } from './dto';

@Injectable()
export class SubCategoriesService {
  constructor(
    @InjectModel(SubCategories.name)
    private readonly subCategoriesModel: Model<SubCategories>,
    @InjectModel(MainCategories.name)
    private readonly mainCategoriesModel: Model<MainCategories>,
  ) {}

  async getSubCategoriesByMainCategory(mainCategoryId: string) {
    const subCategories = await this.subCategoriesModel.find({
      main_category_id: mainCategoryId,
    });
    return { subCategories };
  }

  async createSubCategory(dto: CreateSubCategoryDto) {
    const mainCategory = await this.mainCategoriesModel.findOne({
      _id: dto.main_category_id,
    });
    if (!mainCategory) throw new NotFoundException('Main category not found.');

    const subCategory = await this.subCategoriesModel.create({
      title: dto.title,
      main_category_id: dto.main_category_id,
    });

    await this.mainCategoriesModel.updateOne(
      { _id: dto.main_category_id },
      { $push: { sub_categories: subCategory._id } },
    );

    return { message: 'Sub Category created.' };
  }

  async updateSubCategory(dto: UpdateSubCategoryDto) {
    const mainCategory = await this.mainCategoriesModel.findOne({
      _id: dto.main_category_id,
    });
    if (!mainCategory) throw new NotFoundException('Main category not found.');

    await this.subCategoriesModel.updateOne(
      { _id: dto.category_id },
      { $set: { title: dto.title } },
    );

    return { message: 'Sub Category updated.' };
  }
  async getSubCategoriesByMainCategoryForAdmin(
    mainCategoryId: string,
    page: number = 1,
    pageSize: number = 10,
  ) {
    const skip = (page - 1) * pageSize;

    const query: any = {
      main_category_id: mainCategoryId,
    };

    // Get the total count of documents matching the query
    const totalCount = await this.subCategoriesModel.countDocuments(query);

    const subCategories = await this.subCategoriesModel
      .find(query)
      .skip(skip)
      .limit(pageSize);

    return { subCategories, totalCount };
  }
}

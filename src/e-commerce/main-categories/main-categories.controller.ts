import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { MainCategoriesService } from './main-categories.service';
import { product_types } from '../types';
import { CreateMainCategoryDto, UpdateMainCategoryDto } from './dto';

@Controller('main-categories')
export class MainCategoriesController {
  constructor(private readonly mainCategoryService: MainCategoriesService) {}

  @Get('/pharma')
  getAllPharamCategories() {
    return this.mainCategoryService.getAllCategoriesByType(
      product_types.PHARMA,
    );
  }

  @Get('/food')
  getAllFoodCategories() {
    return this.mainCategoryService.getAllCategoriesByType(product_types.FOOD);
  }

  @Get('/doctor')
  getAllDoctorCategories() {
    return this.mainCategoryService.getAllCategoriesByType(
      product_types.DOCTOR,
    );
  }

  @Post('/pharma/create')
  createPharamCategory(@Body() dto: CreateMainCategoryDto) {
    return this.mainCategoryService.createMainCategory(
      dto,
      product_types.PHARMA,
    );
  }

  @Post('/food/create')
  createFoodCategory(@Body() dto: CreateMainCategoryDto) {
    return this.mainCategoryService.createMainCategory(dto, product_types.FOOD);
  }

  @Post('/doctor/create')
  createDoctorCategory(@Body() dto: CreateMainCategoryDto) {
    return this.mainCategoryService.createMainCategory(
      dto,
      product_types.DOCTOR,
    );
  }

  @Put('/pharma/update')
  updatePharamCategory(@Body() dto: UpdateMainCategoryDto) {
    return this.mainCategoryService.updateMainCategory(dto);
  }

  @Put('/food/update')
  updateFoodCategory(@Body() dto: UpdateMainCategoryDto) {
    return this.mainCategoryService.updateMainCategory(dto);
  }

  @Put('/doctor/update')
  updateDoctorCategory(@Body() dto: UpdateMainCategoryDto) {
    return this.mainCategoryService.updateMainCategory(dto);
  }
}

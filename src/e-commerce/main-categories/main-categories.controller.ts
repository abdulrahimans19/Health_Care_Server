import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { MainCategoriesService } from './main-categories.service';
import { product_types } from '../types';
import { CreateMainCategoryDto, UpdateMainCategoryDto } from './dto';
import { RoleGuard } from 'src/shared/guards';
import { UserRoles } from 'src/user/schema/user.schema';
import { Roles } from 'src/shared/decorators';

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
  @Roles(UserRoles.ADMIN)
  @UseGuards(RoleGuard)
  createPharamCategory(@Body() dto: CreateMainCategoryDto) {
    return this.mainCategoryService.createMainCategory(
      dto,
      product_types.PHARMA,
    );
  }

  @Post('/food/create')
  @Roles(UserRoles.ADMIN)
  @UseGuards(RoleGuard)
  createFoodCategory(@Body() dto: CreateMainCategoryDto) {
    return this.mainCategoryService.createMainCategory(dto, product_types.FOOD);
  }

  @Post('/doctor/create')
  @Roles(UserRoles.ADMIN)
  @UseGuards(RoleGuard)
  createDoctorCategory(@Body() dto: CreateMainCategoryDto) {
    return this.mainCategoryService.createMainCategory(
      dto,
      product_types.DOCTOR,
    );
  }

  @Put('/pharma/update')
  @Roles(UserRoles.ADMIN)
  @UseGuards(RoleGuard)
  updatePharamCategory(@Body() dto: UpdateMainCategoryDto) {
    return this.mainCategoryService.updateMainCategory(dto);
  }

  @Put('/food/update')
  @Roles(UserRoles.ADMIN)
  @UseGuards(RoleGuard)
  updateFoodCategory(@Body() dto: UpdateMainCategoryDto) {
    return this.mainCategoryService.updateMainCategory(dto);
  }

  @Put('/doctor/update')
  @Roles(UserRoles.ADMIN)
  @UseGuards(RoleGuard)
  updateDoctorCategory(@Body() dto: UpdateMainCategoryDto) {
    return this.mainCategoryService.updateMainCategory(dto);
  }
}

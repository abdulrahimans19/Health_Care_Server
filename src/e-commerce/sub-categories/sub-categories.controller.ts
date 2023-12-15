import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { SubCategoriesService } from './sub-categories.service';
import { CreateSubCategoryDto, UpdateSubCategoryDto } from './dto';

@Controller('sub-categories')
export class SubCategoriesController {
  constructor(private readonly subCategoriesService: SubCategoriesService) {}

  @Get('/:id')
  getSubCategoryByMainCategory(@Param('id') mainCategoryId: string) {
    return this.subCategoriesService.getSubCategoriesByMainCategory(
      mainCategoryId,
    );
  }

  @Post('/create')
  createSubCategory(@Body() createSubCategoryDto: CreateSubCategoryDto) {
    return this.subCategoriesService.createSubCategory(createSubCategoryDto);
  }

  @Put('/update')
  updateSubCategory(@Body() updateSubCategoryDto: UpdateSubCategoryDto) {
    return this.subCategoriesService.updateSubCategory(updateSubCategoryDto);
  }
}

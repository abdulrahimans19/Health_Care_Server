import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { SubCategoriesService } from './sub-categories.service';
import { CreateSubCategoryDto, UpdateSubCategoryDto } from './dto';
import { RoleGuard } from 'src/shared/guards';
import { UserRoles } from 'src/user/schema/user.schema';
import { Roles } from 'src/shared/decorators';

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
  @Roles(UserRoles.ADMIN)
  @UseGuards(RoleGuard)
  createSubCategory(@Body() createSubCategoryDto: CreateSubCategoryDto) {
    return this.subCategoriesService.createSubCategory(createSubCategoryDto);
  }

  @Put('/update')
  @Roles(UserRoles.ADMIN)
  @UseGuards(RoleGuard)
  updateSubCategory(@Body() updateSubCategoryDto: UpdateSubCategoryDto) {
    return this.subCategoriesService.updateSubCategory(updateSubCategoryDto);
  }
  @Get('/admin/:id')
  getSubCategoryByMainCategoryForAdmin(@Param('id') mainCategoryId: string) {
    return this.subCategoriesService.getSubCategoriesByMainCategoryForAdmin(
      mainCategoryId,
    );
  }
}

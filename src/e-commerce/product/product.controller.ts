import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto } from './dto';
import { product_types } from '../types';
import { Roles } from 'src/shared/decorators';
import { UserRoles } from 'src/user/schema/user.schema';
import { RoleGuard } from 'src/shared/guards';
import { GetProfileId } from 'src/shared/decorators/get-profile-id.decorator';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('/pharma')
  getPharmaProducts(
    @GetProfileId() profile_id: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.productService.getProducts(
      profile_id,
      product_types.PHARMA,
      page,
      pageSize,
    );
  }

  @Get('/food')
  getFoodProducts(
    @GetProfileId() profile_id: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.productService.getProducts(
      profile_id,
      product_types.FOOD,
      page,
      pageSize,
    );
  }

  @Get('/all-products/:category_id')
  getAllProducts(
    @Param('category_id') category_id: string,
    @GetProfileId() profile_id: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.productService.getProductsByMainCategory(
      profile_id,
      category_id,
      page,
      pageSize,
      sortBy || 'price',
      sortOrder || 'asc',
    );
  }

  @Get('/sub-category/:category_id')
  getAllProductsBySubCategory(
    @Param('category_id') category_id: string,
    @GetProfileId() profile_id: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.productService.getProductsBySubCategory(
      profile_id,
      category_id,
      page,
      pageSize,
      sortBy || 'price',
      sortOrder || 'asc',
    );
  }

  @Get('/single/:id')
  getSingleProduct(
    @Param('id') id: string,
    @GetProfileId() profile_id: string,
  ) {
    return this.productService.getSingleProduct(profile_id, id);
  }

  @Post('/pharma/create')
  @Roles(UserRoles.ADMIN)
  @UseGuards(RoleGuard)
  createPharmaProduct(@Body() dto: CreateProductDto) {
    return this.productService.createProduct(dto, product_types.PHARMA);
  }

  @Post('/food/create')
  @Roles(UserRoles.ADMIN)
  @UseGuards(RoleGuard)
  createFoodProduct(@Body() dto: CreateProductDto) {
    return this.productService.createProduct(dto, product_types.FOOD);
  }

  @Put('/pharma/update')
  @Roles(UserRoles.ADMIN)
  @UseGuards(RoleGuard)
  updatePharmaProduct(@Body() dto: UpdateProductDto) {
    return this.productService.updateProduct(dto);
  }

  @Put('/food/update')
  @Roles(UserRoles.ADMIN)
  @UseGuards(RoleGuard)
  updateFoodProduct(@Body() dto: UpdateProductDto) {
    return this.productService.updateProduct(dto);
  }

  @Delete('/:id')
  @Roles(UserRoles.ADMIN)
  @UseGuards(RoleGuard)
  deleteProduct(@Param('id') id: string) {
    return this.productService.deleteProduct(id);
  }
}

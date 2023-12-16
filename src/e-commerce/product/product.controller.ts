import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto } from './dto';
import { product_types } from '../types';
import { Roles } from 'src/shared/decorators';
import { UserRoles } from 'src/user/schema/user.schema';
import { RoleGuard } from 'src/shared/guards';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('/pharma')
  getPharmaProducts() {
    return this.productService.getProducts(product_types.PHARMA);
  }

  @Get('/food')
  getFoodProducts() {
    return this.productService.getProducts(product_types.FOOD);
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

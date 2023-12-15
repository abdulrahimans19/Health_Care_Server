import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto } from './dto';
import { product_types } from '../types';

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
  createPharmaProduct(@Body() dto: CreateProductDto) {
    return this.productService.createProduct(dto, product_types.PHARMA);
  }

  @Post('/food/create')
  createFoodProduct(@Body() dto: CreateProductDto) {
    return this.productService.createProduct(dto, product_types.FOOD);
  }

  @Put('/pharma/update')
  updatePharmaProduct(@Body() dto: UpdateProductDto) {
    return this.productService.updateProduct(dto);
  }

  @Put('/food/update')
  updateFoodProduct(@Body() dto: UpdateProductDto) {
    return this.productService.updateProduct(dto);
  }

  @Delete('/:id')
  deleteProduct(@Param('id') id: string) {
    return this.productService.deleteProduct(id);
  }
}

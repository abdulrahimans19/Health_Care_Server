import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, product_schema } from './schema/product.schema';
import { FavouritesModule } from '../favourites/favourites.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: product_schema }]),
    FavouritesModule
  ],
  providers: [ProductService],
  controllers: [ProductController],
})
export class ProductModule {}

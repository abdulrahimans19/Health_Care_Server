import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, product_schema } from './schema/product.schema';
import { FavouritesModule } from '../favourites/favourites.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: product_schema }]),
    FavouritesModule,
    UserModule,
  ],
  providers: [ProductService],
  controllers: [ProductController],
})
export class ProductModule {}
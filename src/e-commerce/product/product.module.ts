import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, product_schema } from './schema/product.schema';
import { FavouritesModule } from '../favourites/favourites.module';
import { UserModule } from 'src/user/user.module';
import { CartModule } from '../cart/cart.module';
import { MainCategoriesModule } from '../main-categories/main-categories.module';
import { RecentSearchModule } from '../recent-search/recent-search.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: product_schema }]),
    FavouritesModule,
    CartModule,
    MainCategoriesModule,
    UserModule,
    RecentSearchModule
  ],
  providers: [ProductService],
  controllers: [ProductController],
})
export class ProductModule {}

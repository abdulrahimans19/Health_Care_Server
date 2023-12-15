import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Favourites } from './schema/favourites.schema';
import { Product } from '../product/schema/product.schema';
import { product_types } from '../types';

@Injectable()
export class FavouritesService {
  constructor(
    @InjectModel(Favourites.name)
    private readonly favouritesModel: Model<Favourites>,
    @InjectModel(Product.name)
    private readonly productModel: Model<Product>,
  ) {}

  async getPharmaFavourites(profile_id: string) {
    const favourites = await this.getFavourites(profile_id);
    await favourites.populate({
      path: 'pharma_products',
      model: Product.name,
    });
    return { products: favourites.pharma_products };
  }

  async getFoodFavourites(profile_id: string) {
    const favourites = await this.getFavourites(profile_id);
    await favourites.populate({
      path: 'food_products',
      model: Product.name,
    });
    return { products: favourites.food_products };
  }

  private async getFavourites(profile_id: string) {
    const favourites = await this.favouritesModel
      .findOne({
        profile_id: new Types.ObjectId(profile_id),
      })
      .exec();

    if (!favourites) {
      return await this.favouritesModel.create({ profile_id: profile_id });
    }

    return favourites;
  }

  async addToFavourites(profile_id: string, product_id: string) {
    const product = await this.productModel.findOne({ _id: product_id });

    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    const favourites = await this.favouritesModel.findOne({
      profile_id: profile_id,
    });

    if (!favourites) {
      const newFavourites = {
        profile_id,
        [product.product_type === product_types.FOOD
          ? 'food_products'
          : 'pharma_products']: [new Types.ObjectId(product_id)],
      };

      await this.favouritesModel.create(newFavourites);
    } else {
      const updateField =
        product.product_type === product_types.FOOD
          ? 'food_products'
          : 'pharma_products';

      await this.favouritesModel.updateOne(
        { profile_id: profile_id },
        { $addToSet: { [updateField]: new Types.ObjectId(product_id) } },
      );
    }

    return { message: 'Added to favourites.' };
  }

  async removeFromFavourites(profile_id: string, product_id: string) {
    const favourites = await this.favouritesModel.findOne({
      profile_id: profile_id,
    });

    if (!favourites) {
      throw new NotFoundException('Favourites not found.');
    }

    const isFoodProduct = favourites.food_products.includes(
      new Types.ObjectId(product_id),
    );

    const isPharmaProduct = favourites.pharma_products.includes(
      new Types.ObjectId(product_id),
    );

    if (!isFoodProduct && !isPharmaProduct) {
      throw new NotFoundException('Product not found in favourites.');
    }

    const updateField = isFoodProduct ? 'food_products' : 'pharma_products';

    await this.favouritesModel.updateOne(
      { profile_id: profile_id },
      { $pull: { [updateField]: new Types.ObjectId(product_id) } },
    );

    return { message: 'Removed from favourites.' };
  }

  async isProductInFavorites(
    profileId: string,
    productId: string,
  ): Promise<boolean> {
    const favourites = await this.favouritesModel.findOne({
      profile_id: profileId,
    });

    if (!favourites) {
      return false; // User has no favorites
    }

    const isInPharmaProducts = favourites.pharma_products.some((id) =>
      id.equals(productId),
    );
    const isInFoodProducts = favourites.food_products.some((id) =>
      id.equals(productId),
    );

    return isInPharmaProducts || isInFoodProducts;
  }
}

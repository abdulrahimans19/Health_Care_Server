import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './schema/product.schema';
import { CreateProductDto, UpdateProductDto } from './dto';
import { product_types } from '../types';
import { FavouritesService } from '../favourites/favourites.service';
import { CartService } from '../cart/cart.service';
import { MainCategoriesService } from '../main-categories/main-categories.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    private readonly favouritesService: FavouritesService,
    private readonly mainCategoriesService: MainCategoriesService,
    private readonly cartService: CartService,
  ) {}

  async getProducts(
    profileId: string,
    productType: product_types,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<any> {
    const skip = (page - 1) * pageSize;

    const products = await this.productModel
      .find({ product_type: productType })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(pageSize);

    const enhancedProducts = await this.convertProductWithCartAndWishlistStatus(
      products,
      profileId,
    );

    return { products: enhancedProducts };
  }

  async getProductsByMainCategory(
    profileId: string,
    category_id: string,
    page: number = 1,
    pageSize: number = 10,
    sortBy: string = 'price',
    sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    const skip = (page - 1) * pageSize;

    const mainCategory = await this.mainCategoriesService.getSingleCategory(
      category_id,
    );

    if (!mainCategory) {
      throw new NotFoundException('Main category not found.');
    }

    const subCategoryIds = mainCategory.sub_categories.map((subCategory) =>
      subCategory.toString(),
    );

    const products = await this.productModel
      .find({
        sub_category_id: { $in: subCategoryIds },
      })
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(pageSize);

    const enhancedProducts = await this.convertProductWithCartAndWishlistStatus(
      products,
      profileId,
    );

    return { products: enhancedProducts };
  }

  async getProductsBySubCategory(
    profileId: string,
    category_id: string,
    page: number = 1,
    pageSize: number = 10,
    sortBy: string = 'price',
    sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    const skip = (page - 1) * pageSize;

    const products = await this.productModel
      .find({
        sub_category_id: category_id,
      })
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(pageSize);

    const enhancedProducts = await this.convertProductWithCartAndWishlistStatus(
      products,
      profileId,
    );

    return { products: enhancedProducts };
  }

  async getSingleProduct(profileId: string, productId: string) {
    const product = await this.productModel
      .findOne({ _id: productId })
      .populate('reviews');

    if (!product) {
      return { product: null, relatedProducts: [] };
    }

    const cartStatus = await this.cartService.isProductInCart(
      profileId,
      productId,
      product.product_type,
    );

    const favouritesStatus = await this.favouritesService.isProductInFavorites(
      profileId,
      productId,
      product.product_type,
    );

    const relatedProducts = await this.productModel.find({
      sub_category_id: product.sub_category_id,
      _id: { $ne: product._id },
    });

    const enhancedProduct = {
      ...(product.toJSON() as Product),
      cartStatus,
      favouritesStatus,
    };

    return { product: enhancedProduct, relatedProducts };
  }

  async createProduct(dto: CreateProductDto, productType: product_types) {
    await this.productModel.create({
      name: dto.name,
      description: dto.description,
      image: dto.image,
      price: dto.price,
      offer_price: dto?.offer_price,
      sub_category_id: dto.sub_category_id,
      brand: dto?.brand,
      quantity: dto.quantity,
      product_type: productType,
    });

    return { message: 'Product Created.' };
  }

  async updateProduct(dto: UpdateProductDto) {
    const { product_id, ...updateData } = dto;

    await this.productModel.updateOne(
      { _id: product_id },
      { $set: updateData },
    );

    return { message: 'Product Updated.' };
  }

  async deleteProduct(productId: string) {
    await this.productModel.updateOne(
      { _id: productId },
      { $set: { is_deleted: true } },
    );

    return { message: 'Product Deleted.' };
  }

  async convertProductWithCartAndWishlistStatus(
    products: Product[],
    profileId: string,
  ) {
    const enhancedProducts = await Promise.all(
      products.map(async (product) => {
        const cartStatus = await this.cartService.isProductInCart(
          profileId,
          product._id,
          product.product_type,
        );

        const favouritesStatus =
          await this.favouritesService.isProductInFavorites(
            profileId,
            product._id,
            product.product_type,
          );

        return {
          ...product.toJSON(),
          cartStatus,
          favouritesStatus,
        };
      }),
    );

    return enhancedProducts;
  }
}

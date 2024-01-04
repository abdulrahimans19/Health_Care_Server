import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product } from './schema/product.schema';
import { CreateProductDto, UpdateProductDto } from './dto';
import { product_types } from '../types';
import { FavouritesService } from '../favourites/favourites.service';
import { CartService } from '../cart/cart.service';
import { MainCategoriesService } from '../main-categories/main-categories.service';
import { RecentSearchService } from '../recent-search/recent-search.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    private readonly favouritesService: FavouritesService,
    private readonly mainCategoriesService: MainCategoriesService,
    private readonly cartService: CartService,
    private readonly recentSearchService: RecentSearchService,
  ) {}

  async getProducts(
    profile_id: string,
    productType: product_types,
    country_code: string,
    page: number = 1,
    pageSize: number = 10,
    sortBy: string = 'price',
    sortOrder: 'asc' | 'desc' = 'desc',
    searchKeyword?: string,
  ): Promise<any> {
    const skip = (page - 1) * pageSize;

    const query: any = {
      product_type: productType,
    };

    if (country_code) {
      query.country_codes = { $in: [country_code, 'all'] };
    }

    if (searchKeyword) {
      await this.recentSearchService.addToRecentSearch(
        profile_id,
        productType,
        searchKeyword,
      );
      query.$or = [
        { name: { $regex: searchKeyword, $options: 'i' } },
        { description: { $regex: searchKeyword, $options: 'i' } },
      ];
    }

    const products = await this.productModel
      .find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(pageSize);

    const enhancedProducts = await this.convertProductWithCartAndWishlistStatus(
      products,
      profile_id,
    );

    return { products: enhancedProducts };
  }

  async getProductsByMainCategory(
    profile_id: string,
    category_id: string,
    country_code: string,
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

    const subCategoryIds = mainCategory.sub_categories.map(
      (subCategory) => subCategory,
    );

    const query: any = {
      sub_category_id: { $in: subCategoryIds },
    };

    if (country_code) {
      query.country_codes = { $in: [country_code] };
    }

    const products = await this.productModel
      .find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(pageSize);

    const enhancedProducts = await this.convertProductWithCartAndWishlistStatus(
      products,
      profile_id,
    );

    return { products: enhancedProducts };
  }

  async getProductsBySubCategory(
    profile_id: string,
    category_id: string,
    country_code: string,
    page: number = 1,
    pageSize: number = 10,
    sortBy: string = 'price',
    sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    const skip = (page - 1) * pageSize;

    const query: any = {
      sub_category_id: category_id,
    };

    if (country_code) {
      query.country_codes = { $in: [country_code, 'all'] };
    }

    const products = await this.productModel
      .find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(pageSize);

    const enhancedProducts = await this.convertProductWithCartAndWishlistStatus(
      products,
      profile_id,
    );

    return { products: enhancedProducts };
  }


  async getSingleProduct(
    profile_id: string,
    productId: string,
    country_code: string,
  ) {
    const product = await this.productModel.findOne({
      _id: new Types.ObjectId(productId),
      country_codes: { $in: [country_code, 'all'] },
    });

    if (!product) {
      return { product: null, relatedProducts: [] };
    }

    const cartStatus = await this.cartService.isProductInCart(
      profile_id,
      productId,
      product.product_type,
    );

    const favouritesStatus = await this.favouritesService.isProductInFavorites(
      profile_id,
      productId,
      product.product_type,
    );

    const relatedProducts = await this.productModel.find({
      sub_category_id: product.sub_category_id.toString(),
      _id: { $ne: product._id },
      country_codes: { $in: [country_code] },
    });

    const enhancedProduct = {
      ...(product.toJSON() as Product),
      cartStatus,
      favouritesStatus,
    };

    const enhancedRelatedProducts = await Promise.all(
      relatedProducts.map(async (relatedProduct: Product) => {
        const relatedCartStatus = await this.cartService.isProductInCart(
          profile_id,
          relatedProduct._id,
          relatedProduct.product_type,
        );

        const relatedFavouritesStatus =
          await this.favouritesService.isProductInFavorites(
            profile_id,
            relatedProduct._id,
            relatedProduct.product_type,
          );

        return {
          ...(relatedProduct.toJSON() as Product),
          cartStatus: relatedCartStatus,
          favouritesStatus: relatedFavouritesStatus,
        };
      }),
    );

    return {
      product: enhancedProduct,
      relatedProducts: enhancedRelatedProducts,
    };
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
      country_codes: dto.country_codes,
    });

    return { message: 'Product Created.' };
  }

  async updateProduct(dto: UpdateProductDto) {
    const { product_id, ...updateData } = dto;

    await this.productModel.updateOne(
      { _id: product_id },
      { $set: { ...updateData } },
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
    profile_id: string,
  ) {
    const enhancedProducts = await Promise.all(
      products.map(async (product) => {
        const cartStatus = await this.cartService.isProductInCart(
          profile_id,
          product._id,
          product.product_type,
        );

        const favouritesStatus =
          await this.favouritesService.isProductInFavorites(
            profile_id,
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

  async getProductsForAdmin(
    profile_id: string,
    productType: product_types,
    country_code: string,
    page: number = 1,
    pageSize: number = 10,
    sortBy: string = 'price',
    sortOrder: 'asc' | 'desc' = 'desc',
    searchKeyword?: string,
  ): Promise<any> {
    const skip = (page - 1) * pageSize;

    const query: any = {
      product_type: productType,
    };

    if (country_code) {
      query.country_codes = { $in: [country_code, 'all'] };
    }

    if (searchKeyword) {
      await this.recentSearchService.addToRecentSearch(
        profile_id,
        productType,
        searchKeyword,
      );
      query.$or = [
        { name: { $regex: searchKeyword, $options: 'i' } },
        { description: { $regex: searchKeyword, $options: 'i' } },
      ];
    }

    // Get the total count of documents matching the query
    const totalCount = await this.productModel.countDocuments(query);

    // Retrieve paginated products
    const products = await this.productModel
      .find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(pageSize);

    const enhancedProducts = await this.convertProductWithCartAndWishlistStatus(
      products,
      profile_id,
    );

    return { products: enhancedProducts, totalCount };
  }

  async getProductsByMainCategoryForAdmin(
    profile_id: string,
    category_id: string,
    country_code: string,
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
  
    const subCategoryIds = mainCategory.sub_categories.map(
      (subCategory) => subCategory,
    );
  
    const query: any = {
      sub_category_id: { $in: subCategoryIds },
    };
  
    if (country_code) {
      query.country_codes = { $in: [country_code] };
    }
  
    // Get the total count of documents matching the query
    const totalCount = await this.productModel.countDocuments(query);
  
    const products = await this.productModel
      .find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(pageSize);
  
    const enhancedProducts = await this.convertProductWithCartAndWishlistStatus(
      products,
      profile_id,
    );
  
    return { products: enhancedProducts, totalCount };
  }
  
  async getProductsBySubCategoryForAdmin(
    profile_id: string,
    category_id: string,
    country_code: string,
    page: number = 1,
    pageSize: number = 10,
    sortBy: string = 'price',
    sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    const skip = (page - 1) * pageSize;
  
    const query: any = {
      sub_category_id: category_id,
    };
  
    if (country_code) {
      query.country_codes = { $in: [country_code, 'all'] };
    }
  
    // Get the total count of documents matching the query
    const totalCount = await this.productModel.countDocuments(query);
  
    const products = await this.productModel
      .find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(pageSize);
  
    const enhancedProducts = await this.convertProductWithCartAndWishlistStatus(
      products,
      profile_id,
    );
  
    return { products: enhancedProducts, totalCount };
  }
  
}

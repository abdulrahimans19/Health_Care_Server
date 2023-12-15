import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './schema/product.schema';
import { Model } from 'mongoose';
import { CreateProductDto, UpdateProductDto } from './dto';
import { product_types } from '../types';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
  ) {}

  async getProducts(product_type: product_types) {
    const products = await this.productModel
      .find({ product_type: product_type })
      .sort({ created_at: -1 });
    return { products };
  }

  async createProduct(dto: CreateProductDto, product_types: product_types) {
    await this.productModel.create({
      name: dto.name,
      description: dto.description,
      image: dto.image,
      price: dto.price,
      offer_price: dto?.offer_price,
      sub_category_id: dto.sub_category_id,
      brand: dto?.brand,
      product_type: product_types,
    });

    return { message: 'Product Created.' };
  }

  async updateProduct(dto: UpdateProductDto) {
    await this.productModel.updateOne(
      { _id: dto.product_id },
      {
        $set: {
          name: dto.name,
          description: dto.description,
          image: dto.image,
          price: dto.price,
          offer_price: dto?.offer_price,
          sub_category_id: dto.sub_category_id,
          brand: dto?.brand,
        },
      },
    );

    return { message: 'Product Updated.' };
  }

  async deleteProduct(product_id: string) {
    await this.productModel.updateOne(
      { _id: product_id },
      { $set: { is_deleted: true } },
    );

    return { message: 'Product Deleted.' };
  }
}

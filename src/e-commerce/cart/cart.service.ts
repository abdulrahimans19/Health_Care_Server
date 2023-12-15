import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart } from './schema/cart.schema';
import { Product } from '../product/schema/product.schema';
import { product_types } from '../types';
import {
  calculateTotalPriceFoodCart,
  calculateTotalPricePharmaCart,
} from '../utils/utils';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name)
    private readonly cartModel: Model<Cart>,
    @InjectModel(Product.name)
    private readonly productModel: Model<Product>,
  ) {}

  async getPharmaCart(profile_id: string) {
    const cart: any = await this.getCart(profile_id);
    await cart.populate({
      path: 'pharma_products.product',
      model: Product.name,
    });

    return calculateTotalPricePharmaCart(cart);
  }

  async getFoodCart(profile_id: string) {
    const cart = await this.getCart(profile_id);
    await cart.populate({
      path: 'food_products.product',
      model: Product.name,
    });

    return calculateTotalPriceFoodCart(cart);
  }

  async addToCart(profile_id: string, product_id: string) {
    await this.updateCartWithProduct(profile_id, product_id, 1);
    return { message: 'Added to cart.' };
  }

  async decreaseQuantity(profile_id: string, product_id: string) {
    await this.updateCartWithProduct(profile_id, product_id, -1);
    return { message: 'Quantity decreased.' };
  }

  async removeFromCart(profile_id: string, product_id: string) {
    const cart = await this.getCart(profile_id);
    const isFoodProduct = cart.food_products.some(
      (item) => item.product.toHexString() === product_id,
    );
    const isPharmaProduct = cart.pharma_products.some(
      (item) => item.product.toHexString() === product_id,
    );

    if (!isFoodProduct && !isPharmaProduct) {
      throw new NotFoundException('Product not found in the cart.');
    }

    const updateField = isFoodProduct ? 'food_products' : 'pharma_products';
    const existingProductIndex = cart[updateField].findIndex(
      (item) => item.product.toHexString() === product_id,
    );

    if (existingProductIndex !== -1) {
      // Remove the product from the cart
      cart[updateField].splice(existingProductIndex, 1);
      await cart.save();
      return { message: 'Removed from cart.' };
    } else {
      throw new NotFoundException('Product not found in the cart.');
    }
  }

  private async getCart(profile_id: string) {
    const cart = await this.cartModel
      .findOne({
        profile_id: new Types.ObjectId(profile_id),
      })
      .exec();

    if (!cart) {
      return await this.cartModel.create({ profile_id });
    }

    return cart;
  }

  private async updateCartWithProduct(
    profile_id: string,
    product_id: string,
    quantityChange: number,
  ) {
    const cart = await this.cartModel.findOne({ profile_id });
    const product = await this.productModel.findOne({ _id: product_id });

    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    const updateField =
      product.product_type === product_types.FOOD
        ? 'food_products'
        : 'pharma_products';

    const existingProductIndex = cart[updateField].findIndex(
      (item) => item.product.toHexString() === product_id,
    );

    if (existingProductIndex !== -1) {
      // Product already exists in the cart, check quantity
      const newQuantity =
        cart[updateField][existingProductIndex].quantity + quantityChange;

      if (newQuantity < 0 || newQuantity > product.quantity) {
        throw new BadRequestException(
          `Invalid quantity. Available: ${product.quantity}`,
        );
      }

      // Update quantity
      cart[updateField][existingProductIndex].quantity = newQuantity;

      if (newQuantity === 0) {
        // If quantity becomes zero, remove the product from the cart
        cart[updateField].splice(existingProductIndex, 1);
      }
    } else {
      // Product does not exist in the cart, add it
      cart[updateField].push({
        product: new Types.ObjectId(product_id),
        quantity: 1,
      });
    }

    await cart.save();
  }
}

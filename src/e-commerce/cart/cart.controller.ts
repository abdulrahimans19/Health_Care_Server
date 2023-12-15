import { Controller, Get, Post, Param, Delete } from '@nestjs/common';
import { CartService } from './cart.service';
import { GetProfileId } from 'src/shared/decorators/get-profile-id.decorator';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get('pharma')
  async getPharmaCart(@GetProfileId() profileId: string) {
    return this.cartService.getPharmaCart(profileId);
  }

  @Get('food')
  async getFoodCart(@GetProfileId() profileId: string) {
    return this.cartService.getFoodCart(profileId);
  }

  @Post('add-to-cart/:productId')
  async addToCart(
    @GetProfileId() profileId: string,
    @Param('productId') productId: string,
  ) {
    return this.cartService.addToCart(profileId, productId);
  }

  @Post('decrease-quantity/:productId')
  async decreaseQuantity(
    @GetProfileId() profileId: string,
    @Param('productId') productId: string,
  ) {
    return this.cartService.decreaseQuantity(profileId, productId);
  }

  @Delete('remove-from-cart/:productId')
  async removeFromCart(
    @GetProfileId() profileId: string,
    @Param('productId') productId: string,
  ) {
    return this.cartService.removeFromCart(profileId, productId);
  }
}

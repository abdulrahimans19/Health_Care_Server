import { Body, Controller, Get, Post } from '@nestjs/common';
import { FavouritesService } from './favourites.service';
import { GetProfileId } from 'src/shared/decorators/get-profile-id.decorator';

@Controller('favourites')
export class FavouritesController {
  constructor(private readonly favouritesService: FavouritesService) {}

  @Get('/pharma')
  getPharmaFavourites(@GetProfileId() profile_id: string) {
    return this.favouritesService.getPharmaFavourites(profile_id);
  }

  @Get('/food')
  getFoodFavourites(@GetProfileId() profile_id: string) {
    return this.favouritesService.getFoodFavourites(profile_id);
  }

  @Post('/add-to-favourites')
  addToFavourites(@GetProfileId() profile_id: string, @Body() dto) {
    return this.favouritesService.addToFavourites(profile_id, dto.product_id);
  }

  @Post('/remove-from-favourites')
  removeFromFavourites(@GetProfileId() profile_id: string, @Body() dto) {
    return this.favouritesService.removeFromFavourites(
      profile_id,
      dto.product_id,
    );
  }
}

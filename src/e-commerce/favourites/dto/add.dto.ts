import { IsMongoId, IsNotEmpty } from 'class-validator';

export class AddToFavourites {
  @IsNotEmpty()
  @IsMongoId()
  product_id: string;
}

import { IsMongoId, IsNotEmpty } from 'class-validator';

export class RemoveFromFavourites {
  @IsNotEmpty()
  @IsMongoId()
  product_id: string;
}

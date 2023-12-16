import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CartCheckoutDto {
  @IsNotEmpty()
  @IsMongoId()
  address_id: string;
}

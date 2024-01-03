import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CartCheckoutDto {
  @IsNotEmpty()
  @IsMongoId()
  address_id: string;

  @IsOptional()
  @IsString()
  coupon: string;

  @IsNotEmpty()
  @IsString()
  payment_mode: string;
}

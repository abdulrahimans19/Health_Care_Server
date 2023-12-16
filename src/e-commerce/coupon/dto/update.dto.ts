import {
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class UpdateCouponDto {
  @IsNotEmpty()
  @IsMongoId()
  coupon_id: string;

  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsNumber()
  discount_percentage: number;

  @IsNotEmpty()
  @IsNumber()
  min_amount: number;

  @IsNotEmpty()
  @IsDateString()
  expiry_date: Date;
}

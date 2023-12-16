import { IsDateString, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCouponDto {
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

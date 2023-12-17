import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ApplyCouponDto {
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  code: string;
}

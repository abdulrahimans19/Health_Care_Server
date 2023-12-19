import { IsNotEmpty, IsString } from 'class-validator';

export class ValidatePaymentDto {
  @IsNotEmpty()
  @IsString()
  payment_mode: string;

  @IsNotEmpty()
  @IsString()
  payment_id: string;
}

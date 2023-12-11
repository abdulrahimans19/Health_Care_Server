import { IsNotEmpty, IsString, IsEmail, Validate } from 'class-validator';
import { WeakPasswordValidator } from 'src/shared/validator/weak-password.validator';

export class ValidateOtpDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  otp: string;

  @IsNotEmpty()
  @Validate(WeakPasswordValidator)
  password: string;
}

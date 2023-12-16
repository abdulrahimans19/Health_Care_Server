import { IsNotEmpty, IsEmail } from 'class-validator';

export class PasswordResetDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

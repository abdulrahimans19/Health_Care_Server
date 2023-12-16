import {
  IsString,
  IsEnum,
  IsOptional,
  IsNotEmpty,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { Gender } from '../schema/user-profile.schema';

export class CreateProfileDto {
  @IsNotEmpty()
  @IsString()
  first_name: string;

  @IsString()
  @IsOptional()
  middle_name?: string;

  @IsNotEmpty()
  @IsString()
  last_name: string;

  @IsNotEmpty()
  @IsEnum(Gender)
  gender: Gender;

  @IsNotEmpty()
  @IsDateString()
  date_of_birth: Date;

  @IsNotEmpty()
  @IsString()
  phone_number: string;

  @IsNotEmpty()
  @IsNumber()
  weight: number;

  @IsNotEmpty()
  @IsNumber()
  height: number;

  @IsString()
  @IsOptional()
  profile_image?: string;
}

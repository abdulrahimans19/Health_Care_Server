import {
  IsString,
  IsEnum,
  IsOptional,
  IsNotEmpty,
  IsMongoId,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { Gender } from '../schema/user-profile.schema';

export class UpdateProfileDto {
  @IsNotEmpty()
  @IsMongoId()
  profile_id: string;

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
  @IsNumber()
  weight: number;

  @IsNotEmpty()
  @IsNumber()
  height: number;

  @IsNotEmpty()
  @IsString()
  phone_number: string;

  @IsString()
  @IsOptional()
  profile_image?: string;
}

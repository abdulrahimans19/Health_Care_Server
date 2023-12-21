import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';

export class DoctorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsMongoId()
  @IsNotEmpty()
  category_id: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  about: string;

  @IsNotEmpty()
  featured: boolean;

  @IsOptional()
  @IsString()
  image: string;

  @IsNumber()
  @IsNotEmpty()
  experience: number;
}

export class RateDto {
  @IsNumber()
  @IsNotEmpty()
  rating: number;
}
